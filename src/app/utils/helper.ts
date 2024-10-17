export const convertEthersMainnet = (value: number) => {
  try {
    const returnValue = (Number(value) * 10 ** 6).toLocaleString("fullwide", {
      useGrouping: false,
    });

    return returnValue;
  } catch (err) {
    console.log("ethers convert error", err);
    return 0;
  }
};
