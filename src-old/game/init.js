import Swal from 'sweetalert2';
import { phases } from '../configuration/phases.config';
import { startGame } from './game';
import { displayHeader } from '../environment/header';
import { displayRoles } from '../roles/role';

let gameIsOn = false;

const init = async () => {
  const mafiaContainer = document.querySelector('.mafia');

  if (!mafiaContainer) {
    Swal.fire({
      text: 'Fatal error in game',
      icon: 'error',
    });
  }

  gameIsOn = false; // TODO: Check the local storage
  if (gameIsOn) {
    // I will implement here later
  } else {
    await startGame(mafiaContainer);
    gameIsOn = true;
  }
};

export { init };
