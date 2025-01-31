export const BrushHandle = (props) => (
    <svg width={7} height={26} {...props}>
        <g fill="none" fillRule="evenodd">
            <rect stroke="#A78BFA" fill="#A78BFA" x={0.5} y={0.5} width={6} height={25} rx={2} />
            <path stroke="#5B21B6" strokeLinecap="square" d="M1.5 5.417v15.166M3.5 5.417v15.166M5.5 5.417v15.166" />
        </g>
    </svg>
);
