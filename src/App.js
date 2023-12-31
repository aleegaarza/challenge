import React, { useRef, useState, useEffect, useCallback } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [img, setImg] = useState([]);
  const [deleteMoveable, setDeleteMoveable] = useState(false);

  const getURL = useCallback(async () => {
    const response = await fetch("https://jsonplaceholder.typicode.com/photos");
    const data = await response.json();

    setImg(data);
  }, []);

  useEffect(() => {
    getURL();
  }, [getURL]);

  const addMoveable = () => {
    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        imgUrl: img[Math.floor(Math.random() * img.length)]?.url,
        updateEnd: true,
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };
  const deleteComponent = () => {
    const updatedMoveables = moveableComponents.filter(
      (moveable) => moveable.id !== selected
    );
    setMoveableComponents(updatedMoveables);
    setDeleteMoveable(false);
  };

  const handleDelete = () => {
    setDeleteMoveable(true);
  };

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      {deleteMoveable && (
        <button onClick={deleteComponent}>Delete Moveable</button>
      )}

      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            setSelected={setSelected}
            isSelected={selected === item.id}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  imgUrl,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  onDelete,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    imgUrl,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const [handlePosX, handlePosY] = e.direction;

    let initialLeft = false;
    let initialTop = false;

    if (handlePosX === -1) {
      initialLeft = true;
    }
    if (handlePosY === -1) {
      initialTop = true;
    }

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top: initialTop ? top - (newHeight - height) : top,
      left: initialLeft ? left - (newWidth - width) : left,
      width: newWidth,
      height: newHeight,
      imgUrl,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia((nodoReferencia) => ({
      ...nodoReferencia,
      height: newHeight,
      width: newWidth,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    }));
  };

  const handleSelect = () => {
    setSelected(id);
    onDelete();
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          backgroundImage: `url("${imgUrl}")`,
          backgroundSize: "cover",
        }}
        onClick={handleSelect}
      />

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top:
              e.top < 0
                ? 0
                : e.top + parentBounds.top + height > parentBounds.bottom
                ? parentBounds.bottom - height - parentBounds.top
                : e.top,
            left:
              e.left < 0
                ? 0
                : e.left > parentBounds.right - parentBounds.left - width
                ? parentBounds.right - parentBounds.left - width
                : e.left,
            width,
            height,
            imgUrl,
          });
        }}
        onResize={onResize}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
