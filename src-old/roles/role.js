import Swal from 'sweetalert2';
import roles from '../configuration/roles.config';
import { displayAction, hideAction } from '../environment/actions';
import roleListMiniTemplate from './role.hbs';

const activeRoleClass = 'role-card--active';

const roleClickHandler = (roleItem, numberOfPlayers, mafiaContainer) => {
  let activeRoles = document.querySelectorAll(`.${activeRoleClass}`);
  if (
    !activeRoles.length ||
    activeRoles.length < numberOfPlayers ||
    roleItem.classList.contains(activeRoleClass)
  ) {
    roleItem.classList.toggle(activeRoleClass);
  } else {
    Swal.fire({
      title: 'Are you sure?',
      html: `You've already chosen ${numberOfPlayers} players.`,
      timer: 5000,
    });
  }

  activeRoles = document.querySelectorAll(`.${activeRoleClass}`);
  if (activeRoles.length === numberOfPlayers) {
    displayAction('ASSIGN_ROLES', mafiaContainer);
  } else {
    hideAction('ASSIGN_ROLES', mafiaContainer);
  }
};

const displayRoles = (mafiaContainer, numberOfPlayers) => {
  let roleList = mafiaContainer.querySelector('.role-list');
  if (!roleList) {
    roleList = document.createElement('div');
    roleList.classList.add('role-list');
    roleList.innerHTML = `<h1>Select ${numberOfPlayers} of the below roles:</h1>`;
    mafiaContainer.appendChild(roleList);
  }

  Object.values(roles).forEach((role) => {
    if (role.limit) {
      for (let index = 0; index < role.limit; index++) {
        roleList.innerHTML += roleListMiniTemplate(role);
      }
    }
  });

  const roleItems = roleList.querySelectorAll('.role-card');
  if (roleItems.length) {
    roleItems.forEach((roleItem) => {
      roleItem.addEventListener(
        'click',
        roleClickHandler.bind(null, roleItem, numberOfPlayers, mafiaContainer)
      );
    });
  }
};

export { displayRoles };
