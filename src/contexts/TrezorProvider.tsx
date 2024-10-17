import React, { useEffect } from "react";
import { toast } from "react-toastify";
import TrezorConnect, { DEVICE } from "@trezor/connect-web";
import { ReactNode } from "react";

interface TrezorProviderProps {
  children: ReactNode;
}
const TrezorProvider = ({ children }: TrezorProviderProps) => {
  useEffect(() => {
    const initializeTrezor = async () => {
      try {
        await TrezorConnect.init({
          lazyLoad: false,
          manifest: {
            email: "example@hotmail.com",
            appUrl: "http://localhost:3000/",
          },
          connectSrc: "https://connect.trezor.io/9/",
        });
        TrezorConnect.manifest({
          email: "ayvazhasan2015@hotmail.com",
          appUrl: "example@hotmail.com",
        });
        console.log("TrezorConnect initialized");
      } catch (error) {
        toast.error(
          "Please check trezor configuration settings. If you have not downloaded Trezor bridge, please install Trezor bridge. If you are using a computer with MacOs operating system, you can continue with the Firefox browser.",
          {
            position: "top-right",
            autoClose: 6000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          }
        );
        console.error("TrezorConnect initialization error:", error);
      }
    };

    initializeTrezor();

    return () => {
      TrezorConnect.dispose();
    };
  }, []);

  const handleDeviceConnect = () => {
    console.log("Device Connected");
  };

  const handleDeviceDisconnect = () => {
    console.log("Device Disconnected");
    localStorage.removeItem("userAddress");
    localStorage.removeItem("trezorPublicKey");
  };

  useEffect(() => {
    TrezorConnect.on(DEVICE.CONNECT, handleDeviceConnect);
    TrezorConnect.on(DEVICE.DISCONNECT, handleDeviceDisconnect);

    return () => {
      TrezorConnect.off(DEVICE.CONNECT, handleDeviceConnect);
      TrezorConnect.off(DEVICE.DISCONNECT, handleDeviceDisconnect);
    };
  }, []);

  return <>{children}</>;
};

export default TrezorProvider;
