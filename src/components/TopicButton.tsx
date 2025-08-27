// src/components/TopicButton.tsx
interface TopicButtonProps {
    topic: string;
    color: string;
}

const TopicButton = ({ topic, color }: TopicButtonProps) => {
    return (
        <button
            type='button'
            className='rounded-2xl border border-transparent p-2 gap-4 bg-slate-100 flex items-center text-left transition-colors hover:bg-slate-200'>
            <div className={`w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0`} style={{ backgroundColor: color }}>
            <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                fill='none'
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#18181B"
            >
                <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z'
                />
            </svg>
            </div>
            <div>
                <h3 className='font-medium text-foreground'>{topic}</h3>
            </div>
        </button>
    )
}

export default TopicButton;
