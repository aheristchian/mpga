import { camelCase } from '../helpers/utils';
import { players } from '../players/player';

const assignRolesHandler = () => {
  const activeRoles = [];
  const activeRoleNodes = document.querySelectorAll('.role-card--active');
  if (activeRoleNodes.length) {
    activeRoleNodes.forEach((roleNode) => {
      activeRoles.push(roleNode.dataset.role);
    });
  }
  window.activeRoleNodes = activeRoleNodes;
  window.activeRoles = activeRoles;
  console.log(activeRoles);
  if (activeRoles.length !== players.length) {
    return;
  }
  players.forEach((player) => {
    player[1] = activeRoles.splice(
      Math.floor(Math.random() * activeRoles.length),
      1
    )[0];
  });
  console.log(players);
  // TODO: Clean the game field!
};

const startGameHandler = () => {};

const createActionButton = (
  buttonCode,
  buttonText,
  clickHandler,
  mafiaContainer
) => {
  let actionList = mafiaContainer.querySelector('.action-list');
  if (!actionList) {
    actionList = document.createElement('div');
    actionList.classList.add('action-list');
    mafiaContainer.appendChild(actionList);
  }
  if (actionList.querySelector(`.action-${camelCase(buttonCode)}`)) {
    return;
  }
  const action = document.createElement('button');
  action.textContent = buttonText;
  action.classList.add('action', `action-${camelCase(buttonCode)}`);
  action.addEventListener('click', clickHandler);
  actionList.appendChild(action);
};

const displayAction = (action, mafiaContainer) => {
  switch (action) {
    case 'ASSIGN_ROLES':
      createActionButton(
        'ASSIGN_ROLES',
        'Assign roles',
        assignRolesHandler,
        mafiaContainer
      );
      break;

    case 'START_GAME':
      createActionButton(
        'START_GAME',
        'Start game',
        startGameHandler,
        mafiaContainer
      );
      break;

    default:
      break;
  }
};

const hideAction = (action, mafiaContainer) => {
  const actionToBeRemoved = mafiaContainer.querySelector(
    `.action-${camelCase(action)}`
  );
  if (actionToBeRemoved) {
    actionToBeRemoved.remove();
  }
};

export { displayAction, hideAction };
