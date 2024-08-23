import {useEffect, useState} from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

const TextWithPopover = ({ textEdited, setTextEdited}) => {

    const [anchorEl, setAnchorEl] = useState(null);
    const [popoverContent, setPopoverContent] = useState([]);
    const [clickedWordId, setClickedWordId] = useState(null);

    // Add a unique id to each text segment to avoid deleting all instances
    const textWithIds = Array.isArray(textEdited) ? textEdited.map((txtEdt, index) => ({
        ...txtEdt,
        id: index
    })) : [];

    const handleClick = (event, id) => {
        const found = textWithIds.find((txtEdt) => txtEdt.id === id);

        if (found) {
            setPopoverContent(found.EditList.map((editItem) => editItem.SuggestedText));
            setAnchorEl(event.currentTarget);
            setClickedWordId(id);
        } else {
            setPopoverContent([]);
            setAnchorEl(null);
        }
    };

    const handleReplace = (replacementWord) => {
        const updatedText = textWithIds.map((txtEdt) =>
            txtEdt.id === clickedWordId ? { ...txtEdt, OriginalText: replacementWord } : txtEdt
        );
        setTextEdited(updatedText);
        setAnchorEl(null);
        setClickedWordId(null);
    };

    const handleDeleteOriginalWord = () => {
        if (clickedWordId === null) return;

        const indexToRemove = textWithIds.findIndex((txtEdt) => txtEdt.id === clickedWordId);

        // Build the updated text array
        let updatedText = textWithIds.reduce((acc, txtEdt, index) => {
            if (index === indexToRemove) {
                // Add a single space if the previous element exists and the current element is not the last one
                if (acc.length > 0 && index < textWithIds.length - 1) {
                    acc[acc.length - 1].OriginalText = acc[acc.length - 1].OriginalText.trim() + ' ';
                }
            } else {
                acc.push(txtEdt);
            }
            return acc;
        }, []);

        // After updating the text, remove extra spaces
        updatedText = removeExtraSpaces(updatedText);

        setTextEdited(updatedText);
        setAnchorEl(null);
        setClickedWordId(null);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setClickedWordId(null);
    };

    // Helper function to remove extra spaces between segments
    const removeExtraSpaces = (textArray) => {
        return textArray.reduce((acc, curr, index) => {
            if (index > 0) {
                const previousSegment = acc[acc.length - 1];
                if (previousSegment.OriginalText === ' ' && curr.OriginalText === ' ') {
                    return acc; // Skip this segment if it is an extra space
                }
            }
            acc.push(curr);
            return acc;
        }, []);
    };

    return (
        <div>
            {textWithIds.map((segment) =>
                segment.OriginalText.trim() === '' ? (
                    <span key={segment.id} style={{ display: 'inline-block', width: '0.5em' }}>&nbsp;</span>
                ) : (
                    <Typography
                        key={segment.id}
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
                            backgroundColor: clickedWordId === segment.id ? '#a5d8ff' : segment.EditList.length > 0 ? '#F7D7DA': 'transparent' ,
                            borderRadius: '4px',
                            '&:hover': {
                                backgroundColor: '#a5d8ff',
                            },
                        }}
                        onClick={(event) => handleClick(event, segment.id)}
                    >
                        {segment.OriginalText}
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
                <div
                    style={{
                        padding: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        fontSize: '16px',
                        fontFamily: 'Verdana, sans-serif',
                        color: '#555',
                    }}
                >
                    {popoverContent.length > 0 ? (
                        popoverContent.map((suggestedWord, index) => (
                            <span
                                key={index}
                                onClick={() => handleReplace(suggestedWord)}
                                style={{
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    color: '#007bff',
                                    backgroundColor: '#f0f0f0',
                                    borderRadius: '4px',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {suggestedWord}
                            </span>
                        ))
                    ) : (
                        <Typography
                            sx={{
                                color: '#999',
                                fontSize: '14px',
                                fontStyle: 'italic',
                                padding: '4px',
                            }}
                        >
                            No suggestions
                        </Typography>
                    )}
                    <span
                        onClick={handleDeleteOriginalWord}
                        style={{
                            cursor: 'pointer',
                            padding: '4px 8px',
                            color: 'red',
                            backgroundColor: '#f8d7da',
                            borderRadius: '4px',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        حذف "{textWithIds.find(txtEdt => txtEdt.id === clickedWordId)?.OriginalText}"
                    </span>
                </div>
            </Popover>
        </div>
    );
};

export default TextWithPopover;