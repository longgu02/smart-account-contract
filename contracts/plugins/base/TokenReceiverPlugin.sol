// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {IERC777Recipient} from "@openzeppelin/contracts/interfaces/IERC777Recipient.sol";
import {IERC1155Receiver} from "@openzeppelin/contracts/interfaces/IERC1155Receiver.sol";

import {ManifestFunction, ManifestAssociatedFunctionType, ManifestAssociatedFunction, PluginManifest, PluginMetadata} from "../../interfaces/IPlugin.sol";
import {BasePlugin} from "./BasePlugin.sol";

/// @title Token Receiver Plugin
/// @author ERC-6900 Authors
/// @notice This plugin allows modular accounts to receive various types of tokens by implementing
/// required token receiver interfaces.
contract TokenReceiverPlugin is
    BasePlugin,
    IERC721Receiver,
    IERC777Recipient,
    IERC1155Receiver
{
    string public constant NAME = "Token Receiver Plugin";
    string public constant VERSION = "1.0.0";
    string public constant AUTHOR = "ERC-6900 Authors";

    // ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    // ┃    Execution functions    ┃
    // ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

    function tokensReceived(
        address,
        address,
        address,
        uint256,
        bytes calldata,
        bytes calldata // solhint-disable-next-line no-empty-blocks
    ) external pure override {}

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC1155Receiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    // ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    // ┃    Plugin interface functions    ┃
    // ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

    /// @inheritdoc BasePlugin
    // solhint-disable-next-line no-empty-blocks
    function onInstall(bytes calldata) external pure override {}

    /// @inheritdoc BasePlugin
    // solhint-disable-next-line no-empty-blocks
    function onUninstall(bytes calldata) external pure override {}

    /// @inheritdoc BasePlugin
    function pluginManifest()
        external
        pure
        override
        returns (PluginManifest memory)
    {
        PluginManifest memory manifest;

        manifest.executionFunctions = new bytes4[](4);
        manifest.executionFunctions[0] = this.tokensReceived.selector;
        manifest.executionFunctions[1] = this.onERC721Received.selector;
        manifest.executionFunctions[2] = this.onERC1155Received.selector;
        manifest.executionFunctions[3] = this.onERC1155BatchReceived.selector;

        // Only runtime validationFunction is needed since callbacks come from token contracts only
        ManifestFunction memory alwaysAllowFunction = ManifestFunction({
            functionType: ManifestAssociatedFunctionType
                .RUNTIME_VALIDATION_ALWAYS_ALLOW,
            functionId: 0, // Unused.
            dependencyIndex: 0 // Unused.
        });
        manifest.runtimeValidationFunctions = new ManifestAssociatedFunction[](
            4
        );
        manifest.runtimeValidationFunctions[0] = ManifestAssociatedFunction({
            executionSelector: this.tokensReceived.selector,
            associatedFunction: alwaysAllowFunction
        });
        manifest.runtimeValidationFunctions[1] = ManifestAssociatedFunction({
            executionSelector: this.onERC721Received.selector,
            associatedFunction: alwaysAllowFunction
        });
        manifest.runtimeValidationFunctions[2] = ManifestAssociatedFunction({
            executionSelector: this.onERC1155Received.selector,
            associatedFunction: alwaysAllowFunction
        });
        manifest.runtimeValidationFunctions[3] = ManifestAssociatedFunction({
            executionSelector: this.onERC1155BatchReceived.selector,
            associatedFunction: alwaysAllowFunction
        });

        manifest.interfaceIds = new bytes4[](3);
        manifest.interfaceIds[0] = type(IERC721Receiver).interfaceId;
        manifest.interfaceIds[1] = type(IERC777Recipient).interfaceId;
        manifest.interfaceIds[2] = type(IERC1155Receiver).interfaceId;

        return manifest;
    }

    /// @inheritdoc BasePlugin
    function pluginMetadata()
        external
        pure
        virtual
        override
        returns (PluginMetadata memory)
    {
        PluginMetadata memory metadata;
        metadata.name = NAME;
        metadata.version = VERSION;
        metadata.author = AUTHOR;
        return metadata;
    }
}
