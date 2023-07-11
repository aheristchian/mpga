import Swal from 'sweetalert2';
import playerListTemplate from './player.hbs';

const players = [];

const transformedPlayers = () => players.toString().replaceAll(',', ', ');

const addPlayer = async () => {
  const { value: player } = await Swal.fire({
    title: "Add player's name",
    input: 'text',
    allowOutsideClick: false,
    allowEscapeKey: false,
    cancelButtonText: 'Enough for now!',
    html: `${players.length} player(s): ${transformedPlayers()}`,
    showCancelButton: players.length > 3, // TODO: Minimum possible amount defined in the game mode
    inputValidator: (value) => {
      if (!value) {
        return 'You need to write something!';
      }
    },
  });

  if (!player) {
    return;
  }
  players.push([player.trim()]);
  return await addPlayer();
};

const displayPlayers = (mafiaContainer) => {
  let playerList = mafiaContainer.querySelector('.player-list');
  if (!playerList) {
    playerList = document.createElement('div');
    playerList.classList.add('player-list');
    playerList.innerHTML = '<h1>Players</h1>';
    mafiaContainer.appendChild(playerList);
  }

  Object.values(players).forEach((player) => {
    playerList.innerHTML += playerListTemplate({ name: player[0] });
  });
};

export { players, addPlayer, displayPlayers };
