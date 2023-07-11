import Swal from 'sweetalert2';
import modes from '../configuration/modes.config';
import { displayHeader } from '../environment/header';
import { players, addPlayer, displayPlayers } from '../players/player';
import { displayRoles } from '../roles/role';

const prepareModes = () => {
  const transformed = {};
  for (const key in modes) {
    if (modes.hasOwnProperty(key)) {
      const value = modes[key];
      transformed[key] = value.name;
    }
  }
  return transformed;
};

const gameModal = {
  title: 'Select a game mode',
  input: 'select',
  allowOutsideClick: false,
  allowEscapeKey: false,
  inputOptions: prepareModes(),
  inputPlaceholder: 'Game mode',
  inputValidator: (value) => {
    return new Promise((resolve) => {
      if (value !== '') {
        resolve();
      } else {
        resolve('You have to select a mode!');
      }
    });
  },
};

const receiveGameMode = async () => {
  const { value: gameMode } = await Swal.fire(gameModal);
  return gameMode;
};

const startGame = async mafiaContainer => {
  const selectedGameMode = await receiveGameMode();
  const gameModeInfo = modes[selectedGameMode];
  await addPlayer();
  
  displayHeader(mafiaContainer, gameModeInfo);
  displayPlayers(mafiaContainer);
  displayRoles(mafiaContainer, players.length);
};

export { startGame };
