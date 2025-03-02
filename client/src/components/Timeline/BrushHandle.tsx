export const BrushHandle = ({ smaller = false, ...rest }) => {
    const handleHeight = smaller ? 20 : 25;
    const handleWidth = 8;

    const y = smaller ? 1 : 2;

    // Add functions to handle pointer capture
    const handlePointerDown = (e) => {
        // Set pointer capture on the handle
        e.target.setPointerCapture(e.pointerId);
    };

    return (
        <g>
            {/* Simple rectangle handle */}
            <rect
                {...rest}
                width={handleWidth}
                height={handleHeight}
                y={y}
                rx={2}
                ry={2}
                fill="#A78BFA"
                stroke="#5B21B6"
                strokeWidth={1}
                style={{
                    cursor: 'ew-resize',
                }}
                onPointerDown={handlePointerDown}
            />

            {/* Invisible larger hit area to make handle easier to grab */}
            <rect
                {...rest}
                width={24}
                height={handleHeight + 10}
                y={y}
                fill="transparent"
                stroke="transparent"
                style={{
                    cursor: 'ew-resize',
                }}
                onPointerDown={handlePointerDown}
            />
        </g>
    );
};

// export const BrushHandle = (props) => (
//     <svg width={7} height={26} {...props} style={{ cursor: 'ew-resize', pointerEvents: 'all' }}>
//         <g fill="none" fillRule="evenodd">
//             <rect stroke="#A78BFA" fill="#A78BFA" x={0.5} y={0.5} width={6} height={25} rx={2} />
//             <path stroke="#5B21B6" strokeLinecap="square" d="M1.5 5.417v15.166M3.5 5.417v15.166M5.5 5.417v15.166" />
//         </g>
//     </svg>
// );
