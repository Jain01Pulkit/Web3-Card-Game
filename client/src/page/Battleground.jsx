import React from "react";
import styles from "../styles";
import { useGlobalContext } from "../context";
import { useNavigate } from "react-router-dom";
import { battlegrounds } from "../assets";
import { Alert } from "../components";
const Battleground = () => {
  const { setshowAlert, showAlert, setBattleGround } = useGlobalContext();
  const navigate = useNavigate();
  const handleBattleGroundChoice = async (ground) => {
    setBattleGround(ground?.id);
    localStorage.setItem("battleground", ground.id);
    setshowAlert({
      status: true,
      type: "info",
      message: `${ground.name} is battle ready!`,
    });
    setTimeout(() => {
      navigate(-1);
    }, 1000);
  };
  return (
    <div className={`${styles.flexCenter} ${styles.battlegroundContainer}`}>
      {showAlert?.status && (
        <Alert type={showAlert.type} message={showAlert?.message} />
      )}
      <h1 className={`${styles.headText} text-center`}>
        Choose your <span className="text-siteViolet">Battle</span>Ground
      </h1>
      <div className={`${styles.flexCenter} ${styles.battleGroundsWrapper}`}>
        {battlegrounds?.map((ground) => (
          <div
            key={ground?.id}
            className={`${styles.flexCenter} ${styles.battleGroundCard}`}
            onClick={() => handleBattleGroundChoice(ground)}
          >
            <img
              src={ground.image}
              alt="ground"
              className={styles.battleGroundCardImg}
            />
            <div className="info absolute">
              <p className={styles.battleGroundCardText}>{ground.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Battleground;
