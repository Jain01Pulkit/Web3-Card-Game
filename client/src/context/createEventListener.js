import { ethers } from "ethers";

import { ABI } from "../contract";
import { playAudio, sparcle } from "../utils/animation.js";
import { defenseSound } from "../assets";

const AddNewEvent = (eventFilter, provider, cb) => {
  provider.removeListener(eventFilter);

  provider.on(eventFilter, (logs) => {
    const parsedLog = new ethers.utils.Interface(ABI).parseLog(logs);

    cb(parsedLog);
  });
};

const getCoords = (cardRef) => {
  const { left, top, width, height } = cardRef.current.getBoundingClientRect();
  return {
    pageX: left + width / 2,
    pageY: top + height / 2.25,
  };
};
export const createEventListeners = ({
  navigate,
  contract,
  provider,
  walletAddress,
  setshowAlert,
  setupdateGameData,
  player1ref,
  player2ref,
}) => {
  const NewPlayerEventFilter = contract.filters.NewPlayer();
  AddNewEvent(NewPlayerEventFilter, provider, ({ args }) => {
    console.log("New PLayer Created", args);
    if (walletAddress.toLowerCase() === args.owner.toLowerCase()) {
      setshowAlert({
        status: true,
        type: "success",
        message: "Registered",
      });
    }
  });
  const NewGameTokenEventFilter = contract.filters.NewGameToken();
  AddNewEvent(NewGameTokenEventFilter, provider, ({ args }) => {
    console.log("New game token Created", args);
    if (walletAddress.toLowerCase() === args.owner.toLowerCase()) {
      setshowAlert({
        status: true,
        type: "success",
        message: "Player game token has been successfully created",
      });
      navigate("/create-battle");
    }
  });
  AddNewEvent(NewPlayerEventFilter, provider, ({ args }) => {
    console.log("New battle started!", args, walletAddress);
    if (
      walletAddress.toLowerCase() == args.player1.toLowerCase() ||
      walletAddress.toLowerCase() == args.player2.toLowerCase()
    ) {
      navigate(`/battle/${args.battleName}`);
    }
    setupdateGameData((prevUpdateGameData) => prevUpdateGameData + 1);
  });

  const BattleMoveEventFilter = contract.filters.BattleMove();
  AddNewEvent(BattleMoveEventFilter, provider, ({ args }) => {
    console.log("Battel move initiated!", args);
  });

  const RoundEndedEvent = contract.filters.RoundEnded();
  AddNewEvent(RoundEndedEvent, provider, ({ args }) => {
    console.log("Round ended!", args, walletAddress);
    for (let i = 0; i < args.damagedPlayers.length; i += 1) {
      if (
        args.damagedPlayers[i] !== "0x0000000000000000000000000000000000000000"
      ) {
        if (args.damagedPlayers[i] === walletAddress) {
          sparcle(getCoords(player1ref));
        } else if (args.damagedPlayers[i] !== walletAddress) {
          sparcle(getCoords(player2ref));
        }
      } else {
        playAudio(defenseSound);
      }
    }
    setupdateGameData((prevUpdateGameData) => prevUpdateGameData + 1);
  });
  const BattleEndedEvent = contract.filters.BattleEnded();
  AddNewEvent(BattleEndedEvent, provider, ({ args }) => {
    console.log("Battle ended!", args, walletAddress);
    if (walletAddress.toLowerCase() === args.winner.toLowerCase()) {
      setshowAlert({ status: true, type: "success", message: "You won!" });
    } else if (walletAddress.toLowerCase() === args.loser.toLowerCase()) {
      setshowAlert({ status: true, type: "failure", message: "You lost!" });
    }
    navigate("/create-battle");
  });
};
