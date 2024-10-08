import { useState } from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const TextWithPopover = ({ textEdited, setTextEdited }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [popoverContent, setPopoverContent] = useState([]);
    const [clickedWordId, setClickedWordId] = useState(null);
    const [selectionRange, setSelectionRange] = useState(null);

    const textWithIds = Array.isArray(textEdited)
        ? textEdited.map((txtEdt, index) => ({
            ...txtEdt,
            id: index,
        }))
        : [];

    const handleClick = (event, id) => {
        const found = textWithIds.find((txtEdt) => txtEdt.id === id);

        if (found) {
            setPopoverContent(
                found.EditList.map((editItem) => ({
                    suggestedText: editItem.SuggestedText,
                    description: editItem.Description,
                }))
            );
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

        let updatedText = textWithIds.reduce((acc, txtEdt, index) => {
            if (index === indexToRemove) {
                if (acc.length > 0 && index < textWithIds.length - 1) {
                    acc[acc.length - 1].OriginalText = acc[acc.length - 1].OriginalText.trim() + ' ';
                }
            } else {
                acc.push(txtEdt);
            }
            return acc;
        }, []);

        updatedText = removeExtraSpaces(updatedText);

        setTextEdited(updatedText);
        setAnchorEl(null);
        setClickedWordId(null);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setClickedWordId(null);
    };

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

    // Handle selection of text with mouse
    const handleTextSelection = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            setSelectionRange(range);
        }
    };

    // Apply styling to the selected text
    const applyStyle = (styleType) => {
        if (selectionRange) {
            document.designMode = 'on';
            const command = {
                bold: 'bold',
                italic: 'italic',
                underline: 'underline',
            }[styleType];
            document.execCommand(command);
            document.designMode = 'off';
        }
    };

    // Copy selected text to clipboard using the Clipboard API
    const copyText = () => {
        const fullText = textWithIds.map((segment) => segment.OriginalText).join(' ');
        if (fullText) {
            navigator.clipboard
                .writeText(fullText)
                .then(() => {
                    alert('کل متن با موفقیت کپی شد!');
                })
                .catch((err) => {
                    alert('مشکلی در کپی کردن متن رخ داده است.');
                    console.error('Error copying text: ', err);
                });
        }
    };

    return (
        <div onMouseUp={handleTextSelection}>
            <div style={{ marginBottom: '10px' }}>
                <Button variant="outlined" onClick={() => applyStyle('bold')} style={{ marginLeft: '8px' }}>
                    Bold
                </Button>
                <Button variant="outlined" onClick={() => applyStyle('italic')} style={{ marginLeft: '8px' }}>
                    Italic
                </Button>
                <Button variant="outlined" onClick={() => applyStyle('underline')} style={{ marginLeft: '8px' }}>
                    Underline
                </Button>
                <Button variant="contained" color="success" onClick={copyText} style={{ marginLeft: '8px' }}>
                    Copy Text
                </Button>
            </div>

            {textWithIds.map((segment) =>
                    segment.OriginalText.trim() === '' ? (
                        <span key={segment.id} style={{ display: 'inline-block', width: '0.5em' }}>
            &nbsp;
          </span>
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
                                backgroundColor: clickedWordId === segment.id ? '#a5d8ff' : segment.EditList.length > 0 ? '#F7D7DA' : 'transparent',
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
                        fontFamily: 'Vazir, Verdana, sans-serif',
                        color: '#555',
                    }}
                >
                    {popoverContent.length > 0 ? (
                        popoverContent.map((item, index) => (
                            <div key={index} style={{ marginBottom: '8px' }}>
                                <div
                                    onClick={() => handleReplace(item.suggestedText)}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '4px 8px',
                                        color: '#007bff',
                                        backgroundColor: '#f0f0f0',
                                        borderRadius: '4px',
                                        whiteSpace: 'nowrap',
                                        display: 'block',
                                    }}
                                >
                                    {item.suggestedText}
                                    <span> </span>
                                    <span
                                        style={{
                                            color: '#555',
                                            fontSize: '1rem',
                                            marginTop: '4px',
                                            fontFamily: 'Vazir, Verdana, sans-serif',
                                        }}
                                    >
                    {item.description}
                  </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <Typography
                            sx={{
                                color: '#999',
                                fontSize: '14px',
                                fontStyle: 'italic',
                                padding: '4px',
                                fontFamily: 'Vazir, Verdana, sans-serif',
                            }}
                        >
                            بدون پیشنهاد ویرایشی
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
            حذف "{textWithIds.find((txtEdt) => txtEdt.id === clickedWordId)?.OriginalText}"
          </span>
                </div>
            </Popover>
        </div>
    );
};

export default TextWithPopover;
