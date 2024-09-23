const STORAGE_KEY = "is-order-tileOrder";
const LINK_ATTR = "data-is-order-tile-link";
/* Classes */
const GRID_CLASS = "is-order-tiles";
const GRID_DRAGGING_CLASS = "is-order-tiles--dragging";
const TILE_CLASS = "is-order-tiles__tile";
const DROP_TARGET_CLASS = "is-order-tiles__drop-target";
const DROP_TARGET_ACTIVE_CLASS = "is-order-tiles__drop-target--active";


function loadOrder() {
    const orderResult = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    const order = Array.isArray(orderResult) ? orderResult : [];
    return order;
}

function saveOrder() {
    const tilesGrid = document.querySelector(`.${GRID_CLASS}`);
    const tiles = [...tilesGrid.querySelectorAll(`[${LINK_ATTR}]`)];
    const tileOrder = tiles
        .map((tile) => getTileLink(tile))
        .filter((link) => !!link);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tileOrder));
}

function getTileLink(tile) {
    return tile.querySelector(".nazev a")?.getAttribute("href");
}

function createDropTarget(attribute, placeFn) {
    const dropTarget = document.createElement("div");
    dropTarget.className = `${DROP_TARGET_CLASS} ${DROP_TARGET_CLASS}--${attribute}`;
    dropTarget.addEventListener("dragenter", (e) => {
        e.preventDefault();
        dropTarget.classList.add(DROP_TARGET_ACTIVE_CLASS);
    });
    dropTarget.addEventListener("dragleave", (e) => {
        e.preventDefault();
        dropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
    });
    dropTarget.addEventListener("dragover", (e) => {
        e.preventDefault();
    });
    dropTarget.addEventListener("drop", (e) => {
        e.preventDefault();
        const dragLink = e.dataTransfer.getData("text/plain");
        const dragTile = document.querySelector(`[${LINK_ATTR}="${dragLink}"]`);
        placeFn(dragTile);
        saveOrder();
    });
    return dropTarget;
}


function main() {
    const order = loadOrder();

    const nativeTilesContainer = document.querySelector("#dlazdice");
    if (!nativeTilesContainer) {
        console.log("No tiles:(");
        return;
    }
    nativeTilesContainer.style.display = "none";

    const tilesGrid = document.createElement("div");
    tilesGrid.className = GRID_CLASS;
    nativeTilesContainer.after(tilesGrid);

    const nativeTiles = [...nativeTilesContainer.querySelectorAll(".dlazdice")]
        .sort((tileA, tileB) => {
            const linkA = getTileLink(tileA);
            const linkB = getTileLink(tileB);
            const indexA = order.indexOf(linkA);
            const indexB = order.indexOf(linkB);
            return indexA - indexB;
        });

    nativeTiles.forEach((nativeTile) => {
        const link = getTileLink(nativeTile);
        nativeTile.setAttribute("draggable", true);
        nativeTile.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", link);
            tilesGrid.classList.add(GRID_DRAGGING_CLASS);
        });
        nativeTile.addEventListener("dragend", () => {
            tilesGrid.classList.remove(GRID_DRAGGING_CLASS);
            document.querySelectorAll(`.${DROP_TARGET_ACTIVE_CLASS}`)
                .forEach((el) => el.classList.remove(DROP_TARGET_ACTIVE_CLASS));
        });

        const tile = document.createElement("div");
        tile.className = TILE_CLASS;
        tile.setAttribute(LINK_ATTR, link);
        tile.appendChild(nativeTile);

        tile.appendChild(createDropTarget("before", (dragTarget) => tile.before(dragTarget)));
        tile.appendChild(createDropTarget("after", (dragTarget) => tile.after(dragTarget)));

        tilesGrid.appendChild(tile);
    });

    if (nativeTiles.length % 3) {
        new Array(3 - nativeTiles.length % 3).fill(0).forEach(() => {
            const emptyTile = document.createElement("div");
            emptyTile.className = TILE_CLASS;
            tilesGrid.appendChild(emptyTile);
        });
    }
}

main();
