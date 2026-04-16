import { SVGAttributes } from 'react';

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="clipboard-border" x1="114" y1="104" x2="390" y2="408" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0F4C9B" />
                    <stop offset="1" stopColor="#1B77D2" />
                </linearGradient>
                <linearGradient id="clipboard-clip" x1="182" y1="74" x2="330" y2="160" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFC62E" />
                    <stop offset="1" stopColor="#FF8A1F" />
                </linearGradient>
                <linearGradient id="swoosh" x1="112" y1="160" x2="404" y2="392" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#63D11E" />
                    <stop offset="0.34" stopColor="#39C9D5" />
                    <stop offset="0.68" stopColor="#2C84F4" />
                    <stop offset="1" stopColor="#FF9800" />
                </linearGradient>
            </defs>

            <path
                d="M125 205C157 160 210 132 275 128C344 124 388 149 413 184C428 206 435 230 438 248C441 271 437 296 427 319C404 370 347 405 274 416C196 428 123 404 86 357"
                fill="none"
                stroke="url(#swoosh)"
                strokeWidth="28"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M108 344C90 309 93 264 119 224C150 177 206 148 270 144C324 141 373 157 405 184"
                fill="none"
                stroke="url(#swoosh)"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.55"
            />

            <rect x="146" y="112" width="220" height="278" rx="24" fill="#FFFFFF" />
            <rect x="146" y="112" width="220" height="278" rx="24" fill="none" stroke="url(#clipboard-border)" strokeWidth="18" />

            <path d="M203 112V92C203 80 212 71 224 71H288C300 71 309 80 309 92V112" fill="url(#clipboard-clip)" />
            <rect x="210" y="86" width="92" height="42" rx="16" fill="url(#clipboard-clip)" />
            <circle cx="256" cy="98" r="13" fill="#FFF3B0" />
            <circle cx="256" cy="98" r="6" fill="#FF9A21" />

            <rect x="194" y="180" width="132" height="10" rx="5" fill="#D8DCE6" />
            <rect x="194" y="223" width="132" height="10" rx="5" fill="#D8DCE6" />
            <rect x="194" y="266" width="132" height="10" rx="5" fill="#D8DCE6" />

            <rect x="170" y="170" width="30" height="30" rx="6" fill="#F9C53C" />
            <rect x="170" y="213" width="30" height="30" rx="6" fill="#F9C53C" />
            <rect x="170" y="256" width="30" height="30" rx="6" fill="#FF774A" />

            <path d="M177 185L184 192L196 179" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M177 228L184 235L196 222" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M177 271L184 278L196 265" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

            <path
                d="M224 274L253 301L333 223"
                fill="none"
                stroke="#60C628"
                strokeWidth="28"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <circle cx="95" cy="154" r="8" fill="#F8C52A" />
            <circle cx="115" cy="128" r="5" fill="#69D13E" />
            <circle cx="404" cy="336" r="7" fill="#F8C52A" />
            <circle cx="384" cy="364" r="5" fill="#69D13E" />
        </svg>
    );
}
