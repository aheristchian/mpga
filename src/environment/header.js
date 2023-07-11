import headerTemplate from "./header.hbs";

const displayHeader = (mafiaContainer, game) => {
    mafiaContainer.innerHTML = headerTemplate(game);
}

export {
    displayHeader,
}