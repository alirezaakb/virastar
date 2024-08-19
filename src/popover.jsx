import { useState } from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

const TextWithPopover = ({ textEdited }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [popoverContent, setPopoverContent] = useState('');
    const [clickedWord, setClickedWord] = useState('');

    // تفکیک متن به کلمات و فضاها
    const segments = textEdited.map((word) => word.OriginalText);

    const handleClick = (event, word) => {
        if (word.trim()) {
            // پیدا کردن کلمه مورد نظر در textEdited
            const found = textEdited.find((txtEdt) => txtEdt.OriginalText === word);
            if (found) {
                setPopoverContent(found.RefineText);
            } else {
                setPopoverContent(''); // اگر کلمه‌ای پیدا نشود
            }

            setAnchorEl(event.currentTarget);
            setClickedWord(word.trim());
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
        setClickedWord('');
    };

    return (
        <div>
            {segments.map((segment, index) =>
                segment.trim() === '' ? (
                    <span key={index} style={{ display: 'inline-block', width: '0.5em' }}>&nbsp;</span>
                ) : (
                    <Typography
                        key={index}
                        variant="body1"
                        component="span"
                        sx={{
                            display: 'inline-block',
                            margin: '0',
                            padding: '0',
                            fontSize: '18px',
                            cursor: 'pointer',
                            fontFamily: 'Vazir, sans-serif',
                            color: '#333',
                            backgroundColor: clickedWord === segment.trim() ? '#a5d8ff' : 'transparent',
                            borderRadius: '4px',
                            '&:hover': {
                                backgroundColor: '#a5d8ff',
                            },
                        }}
                        onClick={(event) => handleClick(event, segment)}
                    >
                        {segment}
                    </Typography>
                )
            )}
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <Typography
                    sx={{
                        p: 2,
                        fontSize: '16px',
                        fontFamily: 'Verdana, sans-serif',
                        color: '#555',
                    }}
                >
                    {popoverContent}
                </Typography>
            </Popover>
        </div>
    );
};

export default TextWithPopover;
