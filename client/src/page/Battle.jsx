import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../styles";
import { ActionButton, Alert, GameInfo, PLayerInfo } from "../components";
import { useGlobalContext } from "../context";
import {
  attack,
  attackSound,
  defense,
  defenseSound,
  player01 as player01Icon,
  player02 as player02Icon,
} from "../assets";
import { playAudio } from "../utils/animation";
import Card from "../components/Card";

const Battle = () => {
  const {
    contract,
    gameData,
    walletAddress,
    showAlert,
    setShowAlert,
    setBattleGround,
    battleGround,
    setErrorMessage,
    player1ref,
    player2ref,
  } = useGlobalContext();
  const [player1, setplayer1] = useState({});
  const [player2, setplayer2] = useState({});
  const { battleName } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const getPlayerInfo = async () => {
      try {
        let player01Address = null;
        let player02Address = null;
        if (
          gameData.activeBattle.player[0].toLowerCase() ===
          walletAddress.toLowerCase()
        ) {
          player01Address = gameData.activeBattle.player[0];
          player02Address = gameData.activeBattle.player[1];
        } else {
          player01Address = gameData.activeBattle.player[1];
          player02Address = gameData.activeBattle.player[0];
        }
        const p1TokenData = await contract.getPlayerToken(player01Address);
        const player01 = await contract.getPlayer(player01Address);
        const player02 = await contract.getPlayer(player02Address);
        const p1Att = p1TokenData.attackStrength.toNumber();
        const p1Def = p1TokenData.defenseStrength.toNumber();
        const p1H = player01.playerHealth.toNumber();
        const p1M = player01.playerMana.toNumber();
        const p2H = player02.playerHealth.toNumber();
        const p2M = player02.playerMana.toNumber();
        setplayer1({
          ...player01,
          att: p1Att,
          def: p1Def,
          health: p1H,
          mana: p1M,
        });
        setplayer2({ ...player02, att: "X", def: "X", health: p2H, mana: p2M });
      } catch (error) {
        setErrorMessage(error);
      }
    };
    if (contract && gameData.activeBattle) getPlayerInfo();
  }, [contract, gameData, battleName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!gameData?.activeBattle) navigate("/");
    }, [2000]);
    return () => clearTimeout(timer);
  }, []);
  const makeAmove = async (choice) => {
    playAudio(choice === 1 ? attackSound : defenseSound);

    try {
      await contract.attackOrDefendChoice(choice, battleName, {
        gasLimit: 2000000,
      });
      setShowAlert({
        status: true,
        type: "info",
        message: `Initiating ${choice === 1 ? "attack" : "defense"}`,
      });
    } catch (error) {
      setErrorMessage(error);
    }
  };
  return (
    <div
      className={`${styles.flexBetween} ${styles.gameContainer} ${battleGround}`}
    >
      {showAlert?.status && (
        <Alert type={showAlert.type} message={showAlert.message} />
      )}
      <PLayerInfo player={player2} playerIcon={player02Icon} mt />
      <div className={`${styles.flexCenter} flex-col my-10`}>
        <Card
          card={player2}
          title={player2?.playerName}
          cardRef={player2ref}
          playerTwo
        />
        <div className="flex items-center flex-row">
          <ActionButton
            imgUrl={attack}
            handleClick={() => {
              makeAmove(1);
            }}
            restStyles="mr-2 hover:border-yellow-400"
          />
          <Card
            card={player1}
            title={player1?.playerName}
            cardRef={player1ref}
            restStyles="mt-3"
          />
          <ActionButton
            imgUrl={defense}
            handleClick={() => {
              makeAmove(2);
            }}
            restStyles="ml-6 hover:border-red-600"
          />
        </div>
      </div>
      <PLayerInfo player={player1} playerIcon={player01Icon} mt />
      <GameInfo />
    </div>
  );
};

export default Battle;
