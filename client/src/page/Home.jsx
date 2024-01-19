import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHOC, CustomInput, CustomButton } from "../components";
import { useGlobalContext } from "../context";
const Home = () => {
  const { contract, walletAddress, setshowAlert, gameData, setErrorMessage } =
    useGlobalContext();
  const [playerName, setplayerName] = useState("");
  const navigate = useNavigate();
  const handleClick = async () => {
    console.log("playerExists", walletAddress);
    try {
      const playerExists = await contract.isPlayer(walletAddress);

      if (!playerExists) {
        await contract.registerPlayer(playerName, playerName);

        setshowAlert({
          status: true,
          type: "info",
          message: `${playerName} is being summoned!!!!`,
        });
      }
    } catch (error) {
      setErrorMessage(error);
    }
  };
  useEffect(() => {
    const checkForPlayerToken = async () => {
      const playerExists = await contract.isPlayer(walletAddress);
      const playerTokenExists = await contract.isPlayerToken(walletAddress);
      console.log("LOL", playerExists, playerTokenExists);
      if (playerExists && playerTokenExists) navigate("/create-battle");
    };
    if (contract) checkForPlayerToken();
  }, [contract]);

  // useEffect(() => {
  //   if ((gameData, setErrorMessage)) {
  //     navigate(`/battle/${gameData?.activeBattle?.name}`);
  //   }
  // }, [gameData, setErrorMessage]);
  return (
    <div className="flex flex-col">
      <CustomInput
        Label="Name"
        placeholder="Enter your player name"
        value={playerName}
        handleValueChange={setplayerName}
      />
      <CustomButton
        title="Register"
        handleClick={handleClick}
        restStyles="mt-6"
      />
    </div>
  );
};

export default PageHOC(
  Home,
  <>
    Welcome to AVAX GODDS <br /> A Web3 NFT Card Game
  </>,
  <>
    Connect your Wallet to start playing <br /> The Ultimate Web3 Battle Card
    Game
  </>
);
