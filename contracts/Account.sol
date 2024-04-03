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
// Factory
import {SingleOwnerPlugin} from "./plugins/base/owner/SingleOwnerPlugin.sol";

contract Account is
    AccountExecutor,
    AccountLoupe,
    IAccount,
    ModuleManager,
    SmartAccountErrors,
    AccountStorageInitializable,
    PluginManagerInternals
{
    uint public count;
    address public owner;
    mapping(address => bool) public signable;
    IEntryPoint private immutable _ENTRY_POINT;

    IEntryPoint private immutable ENTRY_POINT;
    address private immutable SELF;

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
        uint256
    ) external returns (uint256 validationData) {
        // if (msg.sender != address(entryPoint()))
        //     revert CallerIsNotAnEntryPoint(msg.sender);

        (, address validationModule) = abi.decode(
            userOp.signature,
            (bytes, address)
        );
        console.log(validationModule);
        // if (address(_modules[validationModule]) != address(0)) {
        validationData = IAuthorizationModule(validationModule).validateUserOp(
            userOp,
            userOpHash
        );
    }

    function _call(address target, uint256 value, bytes memory data) internal {
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
            let ptr := mload(0x40)
            returndatacopy(ptr, 0, returndatasize())
            if iszero(success) {
                revert(ptr, returndatasize())
            }
        }
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
}

contract AccountFactory {
    // Account public accountImplementation;
    SingleOwnerPlugin public singleOwnerPlugin;

    // address internal singleOwnerPluginAddress;
    // constructor(address entryPoint, address singleOwnerPluginAddress) {
    //     singleOwnerPlugin = SingleOwnerPlugin(singleOwnerPluginAddress);
    // }

    // bytes32 private immutable _PROXY_BYTECODE_HASH;

    // uint32 public constant UNSTAKE_DELAY = 1 weeks;

    // IEntryPoint public entryPoint;

    // address public self;

    // bytes32 public singleOwnerPluginManifestHash;

    // constructor(IEntryPoint _entryPoint, SingleOwnerPlugin _singleOwnerPlugin) {
    //     entryPoint = _entryPoint;
    //     accountImplementation = _deployUpgradeableModularAccount(_entryPoint);
    //     _PROXY_BYTECODE_HASH = keccak256(
    //         abi.encodePacked(
    //             type(ERC1967Proxy).creationCode,
    //             abi.encode(address(accountImplementation), "")
    //         )
    //     );
    //     singleOwnerPlugin = _singleOwnerPlugin;
    //     self = address(this);
    //     // The manifest hash is set this way in this factory just for testing purposes.
    //     // For production factories the manifest hashes should be passed as a constructor argument.
    //     singleOwnerPluginManifestHash = keccak256(
    //         abi.encode(singleOwnerPlugin.pluginManifest())
    //     );
    // }

    // /**
    //  * create an account, and return its address.
    //  * returns the address even if the account is already deployed.
    //  * Note that during UserOperation execution, this method is called only if the account is not deployed.
    //  * This method returns an existing account address so that entryPoint.getSenderAddress() would work even after
    //  * account creation
    //  */
    // function createAccount(
    //     address owner,
    //     uint256 salt
    // ) public returns (UpgradeableModularAccount) {
    //     address addr = Create2.computeAddress(
    //         getSalt(owner, salt),
    //         _PROXY_BYTECODE_HASH
    //     );

    //     // short circuit if exists
    //     if (addr.code.length == 0) {
    //         address[] memory plugins = new address[](1);
    //         plugins[0] = address(singleOwnerPlugin);
    //         bytes32[] memory pluginManifestHashes = new bytes32[](1);
    //         pluginManifestHashes[0] = keccak256(
    //             abi.encode(singleOwnerPlugin.pluginManifest())
    //         );
    //         bytes[] memory pluginInstallData = new bytes[](1);
    //         pluginInstallData[0] = abi.encode(owner);
    //         // not necessary to check return addr since next call will fail if so
    //         new ERC1967Proxy{salt: getSalt(owner, salt)}(
    //             address(accountImplementation),
    //             ""
    //         );

    //         // point proxy to actual implementation and init plugins
    //         UpgradeableModularAccount(payable(addr)).initialize(
    //             plugins,
    //             pluginManifestHashes,
    //             pluginInstallData
    //         );
    //     }

    //     return UpgradeableModularAccount(payable(addr));
    // }

    function createAccount(
        address owner,
        address initModuleAddress,
        address entryPoint,
        address singleOwnerPluginAddress
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
        // address[] memory plugins = new address[](1);
        // singleOwnerPlugin = SingleOwnerPlugin(singleOwnerPluginAddress);

        // plugins[0] = singleOwnerPluginAddress;
        // bytes32[] memory pluginManifestHashes = new bytes32[](1);
        // pluginManifestHashes[0] = keccak256(
        //     abi.encode(singleOwnerPlugin.pluginManifest())
        // );
        // bytes[] memory pluginInstallData = new bytes[](1);
        // pluginInstallData[0] = abi.encode(owner);

        // Account account = Account(payable(acc));
        // account.initialize(plugins, pluginManifestHashes, pluginInstallData);

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
