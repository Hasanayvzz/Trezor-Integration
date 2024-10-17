import TrezorConnect from "@trezor/connect-web";
import { toast } from "react-toastify";

export const ConnectToTrezor = async () => {
  try {
    const response = await TrezorConnect.getPublicKey({
      path: "m/44'/0'/0'/0/0",
      showOnTrezor: true,
    });

    if (response.success) {
      console.log("Public Key:", response.payload.publicKey);
      return response.payload;
    } else {
      console.error("Error:", response?.payload?.error);

      switch (response?.payload?.error) {
        case "Popup closed":
        case "Cancelled":
          toast.error(
            "Login rejected. To log in, you must complete the connection steps with your Trezor device.",
            {
              position: "top-right",
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: false,
              className: "toast-error-container-after",
              progressClassName: "progress-bar-style",
              progress: undefined,
              theme: "light",
              autoClose: 3000,
              icon: false,
            }
          );
          break;

        case "Browser not supported":
          alert("Please use a supported browser (Chrome, Firefox, Brave).");
          break;

        case "Bridge not installed":
          alert("Please install Trezor Bridge.");
          break;

        default:
          console.error("Unhandled error:", response?.payload?.error);
      }

      return null;
    }
  } catch (error) {
    console.error("Trezor connection error:", error);
    return null;
  }
};
