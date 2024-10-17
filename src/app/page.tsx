"use client";
import { ConnectToTrezor } from "@/components/ConnectToTrezor";
import TrezorConnect from "@trezor/connect-web";
import { useState } from "react";
import { toast, ToastOptions } from "react-toastify";
import { convertEthersMainnet } from "./utils/helper";
import { ethers } from "ethers";
export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const handleConnectTrezor = async () => {
    const commonToastOptions: ToastOptions = {
      position: "top-right",
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
      className: "toast-error-container-after",
      progressClassName: "progress-bar-style",
      autoClose: 3000,
    };
    const initializeTrezor = async () => {
      try {
        const savedPublicKey = localStorage.getItem("trezorPublicKey");
        if (savedPublicKey) {
          console.log(
            "Restoring Trezor connection with saved public key:",
            savedPublicKey
          );
          const response = await TrezorConnect.ethereumGetAddress({
            path: "m/44'/60'/0'/0/0",
            showOnTrezor: true,
          });
          console.log("response", response);
          if (!response.success) {
            const errorMessage =
              "Login rejected. To log in, you must complete the connection steps with your Trezor device.";

            switch (response?.payload?.error) {
              case "Popup closed":
              case "Cancelled":
                toast.error(errorMessage, commonToastOptions);
                break;
              default:
                toast.error("Trezor Connection error", commonToastOptions);
                break;
            }
          } else {
            toast.success("Device connected successfully", {
              position: "top-right",
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: false,
              className: "toast-success-container-after",
              progressClassName: "progress-bar-style",

              autoClose: 3000,
            });

            localStorage.setItem("userAddress", response.payload.address);
            setWalletAddress(response?.payload?.address);
          }
        } else {
          const initalizeResponse = await ConnectToTrezor();
          if (initalizeResponse) {
            console.log("initalize response", initalizeResponse);
            const response = await TrezorConnect.ethereumGetAddress({
              path: "m/44'/60'/0'/0/0",
              showOnTrezor: true,
            });
            console.log("response", response);
            if (!response.success) {
              // setCancelledTrezorConnectMessage(false);
              const errorMessage =
                "Login rejected. To log in, you must complete the connection steps with your Trezor device.";

              switch (response?.payload?.error) {
                case "Popup closed":
                case "Cancelled":
                  toast.error(errorMessage, commonToastOptions);
                  break;
                default:
                  toast.error(
                    "Trezor Connection error, please wait 3 sec after try again.",
                    commonToastOptions
                  );
                  break;
              }
            } else {
              const successToastOptions: ToastOptions = {
                ...commonToastOptions,
                className: "toast-success-container-after",
              };

              toast.success(
                "Device connected successfully",
                successToastOptions
              );

              localStorage.setItem("userAddress", response?.payload?.address);
              localStorage.setItem(
                "trezorPublicKey",
                initalizeResponse.publicKey
              );
              setWalletAddress(response?.payload?.address);
            }
          } else {
            // OtcToast(t, "error", "quoteQueue.trezorConnectError");
            //    setCancelledTrezorConnectMessage(true);
          }
        }
      } catch (error) {
        toast.error(
          "Please check Trezor configuration settings. If you have not downloaded Trezor bridge, please install Trezor bridge. If you are using a MacOS computer, you can continue with Firefox.",
          {
            position: "top-right",
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: false,
            className: "toast-success-container-after",
            progressClassName: "progress-bar-style",

            autoClose: 3000,
          }
        );
        console.error("TrezorConnect initialization error:", error);
      }
    };

    initializeTrezor();

    return () => {
      TrezorConnect.dispose();
    };
  };

  const handleTransaction = async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://api.avax-test.network/ext/bc/C/rpc"
    );
    // TrezorConnect ile Ethereum işlemi imzalama
    const tx = {
      to: walletAddress, // Kendisine göndereceği adres
      data: "0x", // Veriler genellikle burada yer alır; bu örnekte boş bırakıldı
    };

    try {
      const signetTXResponse = await TrezorConnect.ethereumSignTransaction({
        path: "m/44'/60'/0'/0/0", // Cüzdan yolu
        transaction: {
          to: String(tx.to), // Alıcı adresi
          value: String(convertEthersMainnet(0)), // Gönderilen değer, 0 test AVAX
          data: tx.data, // İşlem verileri
          chainId: 43113, // Avalanche Fuji test ağı için chainId
          nonce: ethers.utils.hexValue(
            await provider.getTransactionCount(walletAddress)
          ), // Geçerli nonce değeri
          gasLimit: ethers.utils.hexValue(100000), // Gaz limiti
          gasPrice: ethers.utils.hexValue((await provider.getGasPrice())._hex), // Gaz ücreti
        },
      });

      if (signetTXResponse.success === true) {
        toast.success("Transaction completed successfully.", {
          position: "top-right",
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
          className: "toast-success-container-after",
          progressClassName: "progress-bar-style",

          autoClose: 3000,
        });
      }
    } catch (e) {
      console.log("err", e);
      toast.error("An error occurred while performing the transaction", {
        position: "top-right",
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        autoClose: 3000,
      });
    }
  };
  return (
    <div className="container px-5 py-5">
      <div className="d-flex align-items-center justify-content-center h-100 w-100">
        <div className="d-flex flex-column gap-5">
          <button className="connect-btn" onClick={handleConnectTrezor}>
            Connect Trezor Wallet
          </button>
          <div>Connected Wallet Address: {walletAddress}</div>
          <button
            className="transaction-btn"
            disabled={!walletAddress}
            onClick={handleTransaction}>
            Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
