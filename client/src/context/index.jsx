import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { useNavigate } from "react-router-dom";
import { ABI, ADDRESS } from "../contract";
import { createEventListeners } from "./createEventListener";
import { GetParams } from "../utils/onboard";

const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [provider, setProvider] = useState("");
  const [contract, setContract] = useState("");
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");

  const [showAlert, setshowAlert] = useState({
    status: false,
    type: "info",
    message: "",
  });
  const [battleName, setbattleName] = useState("");
  const [gameData, setgameData] = useState({
    players: [],
    pendingBattles: [],
    activeBattle: null,
  });
  const [updateGameData, setupdateGameData] = useState(0);
  const [battleGround, setBattleGround] = useState("bg-astral");
  const player1ref = useRef();
  const player2ref = useRef();

  const navigate = useNavigate();
  useEffect(() => {
    const battlegroundFromLocals = localStorage.getItem("battleground");
    if (battlegroundFromLocals) {
      setBattleGround(battlegroundFromLocals);
    } else {
      localStorage.setItem("battleground", battleGround);
    }
  }, []);
  const updateCurrentWalletAddress = async () => {
    const accounts = await window?.ethereum?.request({
      method: "eth_requestAccounts",
    });

    if (accounts) setWalletAddress(accounts[0]);
  };

  useEffect(() => {
    const resetParams = async () => {
      const currentStep = await GetParams();
      setStep(currentStep.step);
    };
    resetParams();
    window?.ethereum?.on("chainChanged", () => resetParams());
    window?.ethereum?.on("accountsChanged", () => resetParams());
  }, []);
  useEffect(() => {
    updateCurrentWalletAddress();

    window?.ethereum?.on("accountsChanged", updateCurrentWalletAddress);
  }, []);

  useEffect(() => {
    const setSmartContractAndProvider = async () => {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const newProvider = new ethers.providers.Web3Provider(connection);
      console.log("newProvider", newProvider);
      const signer = newProvider.getSigner();
      console.log("signer", signer);

      const newContract = new ethers.Contract(ADDRESS, ABI, signer);
      console.log("newContract", newContract);

      setProvider(newProvider);
      setContract(newContract);
    };

    setSmartContractAndProvider();
  }, []);

  useEffect(() => {
    if (step !== -1 && contract) {
      createEventListeners({
        navigate,
        contract,
        provider,
        walletAddress,
        setshowAlert,
        setupdateGameData,
        player1ref,
        player2ref,
      });
    }
  }, [contract]);

  useEffect(() => {
    if (showAlert?.status) {
      const timer = setTimeout(() => {
        setshowAlert({ status: false, type: "info", message: "" });
      }, [5000]);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  useEffect(() => {
    if (errorMessage) {
      const parsedMessage = errorMessage?.reason
        ?.slice("execution reverted: ".length)
        .slice(0, -1);

      if (parsedMessage)
        ({
          status: true,
          type: "failure",
          message: parsedMessage,
        });
    }
  }, [errorMessage]);

  useEffect(() => {
    const fetchGameData = async () => {
      const fetchedBattles = await contract.getAllBattles();
      const pendingBattles = fetchedBattles.filter(
        (battle) => battle.battleStatus == 0
      );
      let activeBattle;
      fetchedBattles.forEach((battle) => {
        if (
          battle.players.find(
            (player) => player.toLowerCase() == walletAddress.toLowerCase()
          )
        ) {
          if (battle.winner.startsWith("0x00")) {
            activeBattle = battle;
          }
        }
      });
      setgameData({
        pendingBattles: pendingBattles.slice(1),
        activeBattle,
      });
    };
    if (contract) fetchGameData();
  }, [contract, updateGameData]);
  return (
    <GlobalContext.Provider
      value={{
        contract,
        walletAddress,
        showAlert,
        setshowAlert,
        battleName,
        setbattleName,
        gameData,
        setBattleGround,
        battleGround,
        errorMessage,
        setErrorMessage,
        player1ref,
        player2ref,
        updateCurrentWalletAddress,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
export const useGlobalContext = () => useContext(GlobalContext);
