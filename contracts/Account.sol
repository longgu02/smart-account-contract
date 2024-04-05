// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import "@account-abstraction/contracts/core/EntryPoint.sol";
import "@account-abstraction/contracts/interfaces/IAccount.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import {IAuthorizationModule} from "./interfaces/IAuthorizationModule.sol";
import {ModuleManager} from "./base/ModuleManager.sol";
import {SmartAccountErrors} from "./common/Errors.sol";
import {EcdsaOwnershipRegistryModule} from "./modules/EcdsaOwnershipRegistryModule.sol";
// Plugins
import {PluginManagerInternals} from "./plugins/PluginManagerInternals.sol";
import {AccountStorage, HookGroup, getAccountStorage, getPermittedCallKey} from "./plugins/AccountStorage.sol";
import {AccountStorageInitializable} from "./plugins/AccountStorageInitializable.sol";
import {AccountExecutor} from "./plugins/AccountExecutor.sol";
import {AccountLoupe} from "./plugins/AccountLoupe.sol";
import {FunctionReferenceLib} from "./helpers/FunctionReferenceLib.sol";
import {FunctionReference, IPluginManager} from "./interfaces/IPluginManager.sol";
import {IPlugin, PluginManifest} from "./interfaces/IPlugin.sol";
import {IPluginExecutor} from "./interfaces/IPluginExecutor.sol";
// Factory
import {SingleOwnerPlugin} from "./plugins/base/owner/SingleOwnerPlugin.sol";

contract Account is
    AccountExecutor,
    AccountLoupe,
    IAccount,
    ModuleManager,
    SmartAccountErrors,
    IPluginExecutor,
    AccountStorageInitializable,
    PluginManagerInternals
{
    IEntryPoint private immutable ENTRY_POINT;
    address private immutable SELF;

    struct PostExecToRun {
        bytes preExecHookReturnData;
        FunctionReference postExecHook;
    }

    constructor(
        address _owner,
        address _initModuleAddress,
        address _entryPointAddress
    ) {
        // owner = _owner;
        EcdsaOwnershipRegistryModule(_initModuleAddress).initForSmartAccount(
            _owner
        );

        ENTRY_POINT = IEntryPoint(_entryPointAddress);
        SELF = address(this);
    }

    error UnrecognizedFunction(bytes4 selector);
    error ExecFromPluginNotPermitted(address plugin, bytes4 selector);
    error ExecFromPluginExternalNotPermitted(
        address plugin,
        address target,
        uint256 value,
        bytes data
    );
    error NativeTokenSpendingNotPermitted(address plugin);
    error AlwaysDenyRule();
    error PostExecHookReverted(
        address plugin,
        uint8 functionId,
        bytes revertReason
    );
    error PreExecHookReverted(
        address plugin,
        uint8 functionId,
        bytes revertReason
    );

    fallback() external payable {}

    receive() external payable {}

    /**
     * @dev Adds a module to the allowlist.
     * @notice This can only be done via a userOp or a selfcall.
     * @notice Enables the module `module` for the wallet.
     * @param module Module to be allow-listed.
     */
    function enableModule(address module) external virtual override {
        // _requireFromEntryPointOrSelf();
        _enableModule(module);
    }

    event ModularAccountInitialized(IEntryPoint indexed entryPoint);

    function initialize(
        address[] memory plugins,
        bytes32[] memory manifestHashes,
        bytes[] memory pluginInstallDatas
    ) external initializer {
        uint256 length = plugins.length;

        if (
            length != manifestHashes.length ||
            length != pluginInstallDatas.length
        ) {
            revert ArrayLengthMismatch();
        }

        FunctionReference[] memory emptyDependencies = new FunctionReference[](
            0
        );

        for (uint256 i = 0; i < length; ) {
            _installPlugin(
                plugins[i],
                manifestHashes[i],
                pluginInstallDatas[i],
                emptyDependencies
            );

            unchecked {
                ++i;
            }
        }

        emit ModularAccountInitialized(ENTRY_POINT);
    }

    /// @inheritdoc IPluginManager
    function installPlugin(
        address plugin,
        bytes32 manifestHash,
        bytes calldata pluginInstallData,
        FunctionReference[] calldata dependencies // wrapNativeFunction
    ) external override {
        _installPlugin(plugin, manifestHash, pluginInstallData, dependencies);
    }

    /// @inheritdoc IPluginExecutor
    function executeFromPlugin(
        bytes calldata data
    ) external payable override returns (bytes memory) {
        bytes4 selector = bytes4(data[:4]);
        address callingPlugin = msg.sender;

        bytes24 execFromPluginKey = getPermittedCallKey(
            callingPlugin,
            selector
        );

        AccountStorage storage _storage = getAccountStorage();

        if (!_storage.callPermitted[execFromPluginKey]) {
            revert ExecFromPluginNotPermitted(callingPlugin, selector);
        }

        address execFunctionPlugin = _storage.selectorData[selector].plugin;

        if (execFunctionPlugin == address(0)) {
            revert UnrecognizedFunction(selector);
        }

        // PostExecToRun[] memory postExecHooks = _doPreExecHooks(selector, data);

        (bool success, bytes memory returnData) = execFunctionPlugin.call(data);

        if (!success) {
            assembly ("memory-safe") {
                revert(add(returnData, 32), mload(returnData))
            }
        }

        // _doCachedPostExecHooks(postExecHooks);

        return returnData;
    }

    /// @inheritdoc IPluginExecutor
    function executeFromPluginExternal(
        address target,
        uint256 value,
        bytes calldata data
    ) external payable returns (bytes memory) {
        bytes4 selector = bytes4(data);
        AccountStorage storage _storage = getAccountStorage();

        // Make sure plugin is allowed to spend native token.
        if (
            value > 0 &&
            value > msg.value &&
            !_storage.pluginData[msg.sender].canSpendNativeToken
        ) {
            revert NativeTokenSpendingNotPermitted(msg.sender);
        }

        // Check the caller plugin's permission to make this call

        // Check the target contract permission.
        // This first checks that the intended target is permitted at all. If it is, then it checks if any selector
        // is permitted. If any selector is permitted, then it skips the selector-level permission check.
        // If only a subset of selectors are permitted, then it also checks the selector-level permission.
        // By checking in the order of [address specified with any selector allowed], [any address allowed],
        // [address specified and selector specified], along with the extra bool `permittedCall`, we can
        // reduce the number of `sload`s in the worst-case from 3 down to 2.
        bool targetContractPermittedCall = _storage
        .permittedExternalCalls[IPlugin(msg.sender)][target].addressPermitted &&
            (_storage
            .permittedExternalCalls[IPlugin(msg.sender)][target]
                .anySelectorPermitted ||
                _storage
                .permittedExternalCalls[IPlugin(msg.sender)][target]
                    .permittedSelectors[selector]);

        // If the target contract is not permitted, check if the caller plugin is permitted to make any external
        // calls.
        if (
            !(targetContractPermittedCall ||
                _storage.pluginData[msg.sender].anyExternalExecPermitted)
        ) {
            revert ExecFromPluginExternalNotPermitted(
                msg.sender,
                target,
                value,
                data
            );
        }

        // Run any pre exec hooks for this selector
        // PostExecToRun[] memory postExecHooks = _doPreExecHooks(
        //     IPluginExecutor.executeFromPluginExternal.selector,
        //     msg.data
        // );

        // Perform the external call
        bytes memory returnData = _call(target, value, data);

        // Run any post exec hooks for this selector
        // _doCachedPostExecHooks(postExecHooks);

        return returnData;
    }

    /// @inheritdoc IPluginManager
    function uninstallPlugin(
        address plugin,
        bytes calldata config,
        bytes calldata pluginUninstallData // wrapNativeFunction
    ) external override {
        PluginManifest memory manifest;

        if (config.length > 0) {
            manifest = abi.decode(config, (PluginManifest));
        } else {
            manifest = IPlugin(plugin).pluginManifest();
        }

        _uninstallPlugin(plugin, manifest, pluginUninstallData);
    }

    /**
     * @dev Setups module for this Smart Account and enables it.
     * @notice This can only be done via userOp or a selfcall.
     * @notice Enables the module `module` for the wallet.
     */
    function setupAndEnableModule(
        address setupContract,
        bytes memory setupData
    ) external virtual override returns (address) {
        // _requireFromEntryPointOrSelf();
        return _setupAndEnableModule(setupContract, setupData);
    }

    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external returns (uint256 validationData) {
        // if (msg.sender != address(entryPoint()))
        //     revert CallerIsNotAnEntryPoint(msg.sender);

        // (, address validationModule) = abi.decode(
        //     userOp.signature,
        //     (bytes, address)
        // );
        // // if (address(_modules[validationModule]) != address(0)) {
        // validationData = IAuthorizationModule(validationModule).validateUserOp(
        //     userOp,
        //     userOpHash
        // );
        // _payPrefund(missingAccountFunds);
        return 0;
    }

    // function _payPrefund(uint256 missingAccountFunds) internal virtual {
    //     if (missingAccountFunds != 0) {
    //         payable(msg.sender).call{
    //             value: missingAccountFunds,
    //             gas: type(uint256).max
    //         }("");
    //         //ignore failure (its EntryPoint's job to verify, not account.)
    //     }
    // }

    function _call(
        address target,
        uint256 value,
        bytes memory data
    ) internal returns (bytes memory) {
        bytes memory returndata;
        assembly {
            let success := call(
                gas(),
                target,
                value,
                add(data, 0x20),
                mload(data),
                0,
                0
            )
            let returndata_size := returndatasize()
            returndata := mload(0x40)
            returndatacopy(returndata, 0, returndata_size)
            if iszero(success) {
                revert(returndata, returndata_size)
            }
        }
        return returndata;
    }

    function execute_ncC(
        address dest,
        uint256 value,
        bytes calldata func
    ) public {
        // _requireFromEntryPoint();
        _call(dest, value, func);
    }

    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external {
        execute_ncC(dest, value, func);
    }

    //     function _requireFromEntryPoint() internal view {
    //     if (msg.sender != address(entryPoint()))
    //         revert CallerIsNotEntryPoint(msg.sender);
    // }
    function executeBatch(
        address[] calldata dest,
        uint256[] calldata value,
        bytes[] calldata func
    ) external {
        executeBatch_y6U(dest, value, func);
    }

    function executeBatch_y6U(
        address[] calldata dest,
        uint256[] calldata value,
        bytes[] calldata func
    ) public {
        // _requireFromEntryPoint();
        if (
            dest.length == 0 ||
            dest.length != value.length ||
            value.length != func.length
        ) revert WrongBatchProvided(dest.length, value.length, func.length, 0);
        for (uint256 i; i < dest.length; ) {
            _call(dest[i], value[i], func[i]);
            unchecked {
                ++i;
            }
        }
    }

    function checkPluginInstalled(
        address pluginAddress
    ) external view returns (bool) {
        bool result = _checkPluginInstalled(pluginAddress);
        return result;
    }

    // function _doPreExecHooks(
    //     bytes4 selector,
    //     bytes calldata data
    // ) internal returns (PostExecToRun[] memory postHooksToRun) {
    //     HookGroup storage hooks = getAccountStorage()
    //         .selectorData[selector]
    //         .executionHooks;
    //     uint256 preExecHooksLength = hooks.preHooks.length();
    //     uint256 postOnlyHooksLength = hooks.postOnlyHooks.length();
    //     uint256 maxPostExecHooksLength = postOnlyHooksLength;

    //     // There can only be as many associated post hooks to run as there are pre hooks.
    //     for (uint256 i = 0; i < preExecHooksLength; ) {
    //         (, uint256 count) = hooks.preHooks.at(i);
    //         unchecked {
    //             maxPostExecHooksLength += (count + 1);
    //             ++i;
    //         }
    //     }

    //     // Overallocate on length - not all of this may get filled up. We set the correct length later.
    //     postHooksToRun = new PostExecToRun[](maxPostExecHooksLength);
    //     uint256 actualPostHooksToRunLength;

    //     // Copy post-only hooks to the array.
    //     for (uint256 i = 0; i < postOnlyHooksLength; ) {
    //         (bytes32 key, ) = hooks.postOnlyHooks.at(i);
    //         postHooksToRun[actualPostHooksToRunLength]
    //             .postExecHook = _toFunctionReference(key);
    //         unchecked {
    //             ++actualPostHooksToRunLength;
    //             ++i;
    //         }
    //     }

    //     // Then run the pre hooks and copy the associated post hooks (along with their pre hook's return data) to
    //     // the array.
    //     for (uint256 i = 0; i < preExecHooksLength; ) {
    //         (bytes32 key, ) = hooks.preHooks.at(i);
    //         FunctionReference preExecHook = _toFunctionReference(key);

    //         if (preExecHook.isEmptyOrMagicValue()) {
    //             // The function reference must be PRE_HOOK_ALWAYS_DENY in this case, because zero and any other
    //             // magic value is unassignable here.
    //             revert AlwaysDenyRule();
    //         }

    //         bytes memory preExecHookReturnData = _runPreExecHook(
    //             preExecHook,
    //             data
    //         );

    //         uint256 associatedPostExecHooksLength = hooks
    //             .associatedPostHooks[preExecHook]
    //             .length();
    //         if (associatedPostExecHooksLength > 0) {
    //             for (uint256 j = 0; j < associatedPostExecHooksLength; ) {
    //                 (key, ) = hooks.associatedPostHooks[preExecHook].at(j);
    //                 postHooksToRun[actualPostHooksToRunLength]
    //                     .postExecHook = _toFunctionReference(key);
    //                 postHooksToRun[actualPostHooksToRunLength]
    //                     .preExecHookReturnData = preExecHookReturnData;

    //                 unchecked {
    //                     ++actualPostHooksToRunLength;
    //                     ++j;
    //                 }
    //             }
    //         }

    //         unchecked {
    //             ++i;
    //         }
    //     }

    //     // Trim the post hook array to the actual length, since we may have overallocated.
    //     assembly ("memory-safe") {
    //         mstore(postHooksToRun, actualPostHooksToRunLength)
    //     }
    // }

    // function _doCachedPostExecHooks(
    //     PostExecToRun[] memory postHooksToRun
    // ) internal {
    //     uint256 postHooksToRunLength = postHooksToRun.length;
    //     for (uint256 i = postHooksToRunLength; i > 0; ) {
    //         unchecked {
    //             --i;
    //         }

    //         PostExecToRun memory postHookToRun = postHooksToRun[i];
    //         (address plugin, uint8 functionId) = postHookToRun
    //             .postExecHook
    //             .unpack();
    //         // solhint-disable-next-line no-empty-blocks
    //         try
    //             IPlugin(plugin).postExecutionHook(
    //                 functionId,
    //                 postHookToRun.preExecHookReturnData
    //             )
    //         {} catch (bytes memory revertReason) {
    //             revert PostExecHookReverted(plugin, functionId, revertReason);
    //         }
    //     }
    // }

    // function _runPreExecHook(
    //     FunctionReference preExecHook,
    //     bytes calldata data
    // ) internal returns (bytes memory preExecHookReturnData) {
    //     (address plugin, uint8 functionId) = preExecHook.unpack();
    //     try
    //         IPlugin(plugin).preExecutionHook(
    //             functionId,
    //             msg.sender,
    //             msg.value,
    //             data
    //         )
    //     returns (bytes memory returnData) {
    //         preExecHookReturnData = returnData;
    //     } catch (bytes memory revertReason) {
    //         revert PreExecHookReverted(plugin, functionId, revertReason);
    //     }
    // }
}

contract AccountFactory {
    // Account public accountImplementation;
    SingleOwnerPlugin public singleOwnerPlugin;
    bytes32 public singleOwnerPluginManifestHash;

    constructor(address _singleOwnerPlugin) {
        singleOwnerPlugin = SingleOwnerPlugin(_singleOwnerPlugin);
        singleOwnerPluginManifestHash = keccak256(
            abi.encode(singleOwnerPlugin.pluginManifest())
        );
    }

    function createAccount(
        address owner,
        address initModuleAddress,
        address entryPoint
    ) external returns (address) {
        bytes32 salt = bytes32(uint256(uint160(owner)));
        bytes memory creationCode = type(Account).creationCode;
        bytes memory bytecode = abi.encodePacked(
            creationCode,
            abi.encode(owner),
            abi.encode(initModuleAddress),
            abi.encode(entryPoint)
        );

        address addr = Create2.computeAddress(salt, keccak256(bytecode));
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return addr;
        }
        address acc = deploy(salt, bytecode);
        // Plugins
        address[] memory plugins = new address[](1);

        plugins[0] = address(singleOwnerPlugin);
        bytes32[] memory pluginManifestHashes = new bytes32[](1);
        pluginManifestHashes[0] = singleOwnerPluginManifestHash;
        bytes[] memory pluginInstallData = new bytes[](1);
        pluginInstallData[0] = abi.encode(owner);

        Account(payable(acc)).initialize(
            plugins,
            pluginManifestHashes,
            pluginInstallData
        );

        return acc;
    }

    function deploy(
        bytes32 salt,
        bytes memory bytecode
    ) internal returns (address addr) {
        require(bytecode.length != 0, "Create2: bytecode length is zero");
        /// @solidity memory-safe-assembly
        assembly {
            addr := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        require(addr != address(0), "Create2: Failed on deploy");
    }
}
