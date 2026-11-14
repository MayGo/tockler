interface BrushHandleProps {
    smaller?: boolean;
    /** Set by Victory: the handle's hit area, centred on the brush edge. */
    x?: number;
    width?: number;
}

const VISIBLE_WIDTH = 8;

/** Drawn handle, centred in the hit area Victory reserves for it (its `handleWidth`). */
export const BrushHandle = ({ smaller = false, x = 0, width = 0 }: BrushHandleProps) => {
    const height = smaller ? 20 : 25;

    return (
        <rect
            x={x + width / 2 - VISIBLE_WIDTH / 2}
            y={smaller ? 1 : 2}
            width={VISIBLE_WIDTH}
            height={height}
            rx={2}
            ry={2}
            fill="#A78BFA"
            stroke="#5B21B6"
            strokeWidth={1}
            style={{ cursor: 'ew-resize' }}
        />
    );
};
