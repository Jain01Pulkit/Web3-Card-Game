import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles";
import { useGlobalContext } from "../context";
import { CustomButton, PageHOC, CustomInput, GameLoad } from "../components";
const CreateBattle = () => {
  const { contract, battleName, setbattleName, gameData, setErrorMessage } =
    useGlobalContext();
  const [waitBattle, setwaitBattle] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (gameData?.activeBattle?.battleStatus == 1) {
      navigate(`/battle/${gameData.activeBattle.name}`);
    } else if (gameData?.activeBattle?.battleStatus === 0) {
      setwaitBattle(true);
    }
  }, [gameData]);
  const handleClick = async () => {
    if (!battleName || !battleName.trim()) return null;

    try {
      await contract.createBattle(battleName);
      setwaitBattle(true);
    } catch (error) {
      setErrorMessage(error);
    }
  };
  return (
    <>
      {waitBattle && <GameLoad />}
      <div className="flex flex-col mb-5">
        <CustomInput
          Label="Battle"
          placeholder="Enter battle name"
          value={battleName}
          handleValueChange={setbattleName}
        />
        <CustomButton
          title="Create Battle"
          handleClick={handleClick}
          restStyles="mt-6"
        />
      </div>
      <p className={styles.infoText} onClick={() => navigate("/join-battle")}>
        Or join already existing battles
      </p>
    </>
  );
};

export default PageHOC(
  CreateBattle,
  <>
    Create <br /> a new BATTLE
  </>,
  <>
    Create Your own battle and wait for pther players to join you
    <br /> The Ultimate Web3 Battle Card Game
  </>
);
