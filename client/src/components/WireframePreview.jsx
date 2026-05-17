import { useState } from "react";
import { Rnd } from "react-rnd";

function WireframePreview({
  layout,
  setLayout,
}) {

  const [selectedId, setSelectedId] =
    useState(null);

  // Safety checks
  if (!layout?.nodes) {
    return null;
  }

  const artboardId =
    layout.rootNodes?.[0];

  const artboard =
    layout.nodes?.[artboardId];

  if (!artboard) {
    return null;
  }

  const children =
    artboard.children || [];

  // Preview scale
  const scale =
    400 / artboard.width;

  // =========================
  // UPDATE NODE
  // =========================
  const updateNode = (
    nodeId,
    updates
  ) => {

    const updatedLayout =
      structuredClone(layout);

    updatedLayout.nodes[nodeId] = {
      ...updatedLayout.nodes[nodeId],
      ...updates,
    };

    setLayout(updatedLayout);
  };

  return (
    <div className="flex justify-center">

      <div
        className="relative bg-white border overflow-hidden"
        style={{
          width: 400,
          height: 400,
        }}
      >

        {children.map((childId) => {

          const node =
            layout.nodes[childId];

          if (!node) {
            return null;
          }

          // Scale values
          const x =
            node.x * scale;

          const y =
            node.y * scale;

          const width =
            node.width * scale;

          const height =
            node.height * scale;

          return (
            <Rnd
              key={node.id}

              size={{
                width,
                height,
              }}

              position={{
                x,
                y,
              }}

              bounds="parent"

              enableResizing={true}

              onClick={() => {
                setSelectedId(node.id);
              }}

              // =========================
              // DRAG
              // =========================
              onDragStop={(
                e,
                d
              ) => {

                updateNode(
                  node.id,
                  {
                    x: d.x / scale,
                    y: d.y / scale,
                  }
                );
              }}

              // =========================
              // RESIZE
              // =========================
              onResizeStop={(
                e,
                direction,
                ref,
                delta,
                position
              ) => {

                updateNode(
                  node.id,
                  {
                    x:
                      position.x / scale,

                    y:
                      position.y / scale,

                    width:
                      parseFloat(
                        ref.style.width
                      ) / scale,

                    height:
                      parseFloat(
                        ref.style.height
                      ) / scale,
                  }
                );
              }}
            >

              <div
                className={`
                  w-full h-full
                  overflow-hidden
                  select-none
                  ${
                    selectedId === node.id
                      ? "border-2 border-blue-500"
                      : ""
                  }
                `}
              >

                {/* ========================= */}
                {/* TEXT */}
                {/* ========================= */}

                {node.type === "text" && (

                  <div
                    style={{
                      width: "100%",
                      height: "100%",

                      color:
                        node.style?.visual?.color?.value ||
                        "#000",

                      fontSize:
                        (
                          node.style?.visual?.fontSize || 20
                        ) * scale * 0.9,

                      fontWeight:
                        node.style?.visual?.fontWeight ||
                        400,

                      fontStyle:
                        node.style?.visual?.fontStyle ||
                        "normal",

                      whiteSpace:
                        "pre-line",

                      lineHeight: 1.1,
                    }}
                  >
                    {node.data?.content}
                  </div>
                )}

                {/* ========================= */}
                {/* IMAGE */}
                {/* ========================= */}

                {node.type === "image" && (

                  <img
                    src={
                      node.data?.sourceUrl
                    }

                    alt=""

                    draggable={false}

                    className="w-full h-full object-cover pointer-events-none"
                  />
                )}

                {/* ========================= */}
                {/* SHAPE */}
                {/* ========================= */}

                {node.type === "shape" && (

                  <div
                    className="w-full h-full"
                    style={{
                      background:
                        node.style?.visual?.fill?.value ||
                        "#ccc",

                      borderRadius:
                        node.data?.shapeType === "circle"
                          ? "9999px"
                          : "0px",
                    }}
                  />
                )}

              </div>

            </Rnd>
          );
        })}

      </div>

    </div>
  );
}

export default WireframePreview;