import {useEffect, useState} from 'react';
import TextWithPopover from "./popover.jsx";

const KEY = '5d697140-3e5f-ef11-af60-00163e6496fc';
const URL = 'https://api.text-mining.ir';

function App() {

  const [token, setToken] = useState("");
  const [text, setText] = useState("");
  //const [spellCorrect, setSpellCorrect] = useState("");
    const [textEdited, setTextEdited] = useState([]);
    const [textNormalized, setTextNormalized] = useState("");
    const [errorFinding, setErrorFinding] = useState(true);
    const [punctuation, setPunctuation] = useState(false);
    const [puncText, setPuncText] = useState("");

    console.log(textEdited)
    //console.log(textNormalized);

        // دریافت توکن فقط یکبار و ذخیره در state
        useEffect(() => {
            const fetchToken = async () => {
                try {
                    const tokenObject = await fetch(`${URL}/api/Token/GetToken?apikey=${KEY}`);
                    const data = await tokenObject.json();
                    setToken(data.token);
                } catch (error) {
                    console.error('Error fetching token:', error);
                }
            };

            fetchToken();
        }, []); // خالی بودن آرایه dependencies باعث می‌شود که این effect فقط یک‌بار اجرا شود.

    async function textNormalize() {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Accept", "text/plain");
        myHeaders.append("Authorization", `Bearer ${token}`);

        const raw = JSON.stringify({
            "Text": text,
            "ReplaceWildChar": true,
            "ReplaceDigit": true,
            "RefineSeparatedAffix": true,
            "RefineQuotationPunc": false,
            "RemoveExtraChar": true,
            "ReplaceHamzeTanvinTashdidChar": true
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        const res = await fetch(`${URL}/api/PreProcessing/NormalizePersianWord`, requestOptions);
        const data = await res.text();
        setTextNormalized(data);
    }
        // تابعی که نیاز به توکن دارد
        const textEditor = async () => {
            if (!token) return; // اگر توکن هنوز دریافت نشده، اجرا نمی‌شود.

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("Accept", "text/plain");
            myHeaders.append("Authorization", `Bearer ${token}`);

            const raw = JSON.stringify({
                "Text": text,
                "ReturnOnlyChangedTokens": false,
                "WordConfiguration": {
                    "StickingCompoundWords": true,
                    "SplitMultiJoinedWords": true,
                    "SplitVaBeJoinedWords": true,
                    "HighSensitiveRefinement": false,
                    "AlternativeWordSuggestion": true
                },
                "CharConfiguration": {
                    "LetterNormalization": true,
                    "DigitNormalization": true,
                    "PunctuationNormalization": true,
                    "SpaceNormalization": true,
                    "ErabNormalization": true,
                    "RemoveExtraSpace": true,
                    "RemoveExtraHalfSpace": true,
                    "ConvertHeHamzeToHeYe": true,
                    "ConvertHeYeToHeHamze": false
                },
                "WritingRuleConfiguration": {
                    "PrefixCorrection": true,
                    "SuffixCorrection": true,
                    "MorphologicalAnalysis": true,
                    "TanvinCorrection": true,
                    "HamzeCorrection": true,
                    "SpaceBetweenPuncCorrection": true,
                    "RemoveDuplicatePunctuation": true
                },
                "SpellConfiguration": {
                    "CorpusType": "General",
                    "LexicalSpellCheckSuggestionCount": 3,
                    "LexicalSpellCheckerDistanceThreshold": 3.5,
                    "LexicalSpellCheckHighSensitive": false,
                    "RealWordAlternativeSuggestionCount": 2,
                    "ContextSpellCheckHighSensitive": false
                },
                "IgnoreProcessConfiguration": {
                    "IgnoreQuotes": true,
                    "IgnoreWordsWithErab": true,
                },
                "IgnoreQuotes": false,
                "IgnoreWordsWithErab": true,
                "SpellCheckerCandidateCount": 3,
                "RealWordAlternativeCount": 0,
                "ContextSpellCheckHighSensitive": false,
                "LexicalSpellCheckHighSensitive": false,
                "CorpusType": "General"
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow"
            };

            try {
                const res = await fetch(`${URL}/api/Virastar/ScanText`, requestOptions);
                const result = await res.json();
                setTextEdited(result);
            } catch (error) {
                console.error('Error in textEditor:', error);
            }
        };

        useEffect(() => {
            if (token) {
                textEditor();
                PunctuationRestoration();
                 // اجرای تابع textEditor زمانی که توکن دریافت شد
            }
        }, [text]); // این useEffect وقتی توکن تغییر کرد (دریافت شد) اجرا می‌شود


    async function PunctuationRestoration() {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Accept", "text/plain");
        myHeaders.append("Authorization", `Bearer ${token}`);

        const raw = JSON.stringify({
            "Text": text,
            "Type": "Dot, QuestionMark, ExclamationMark, Comma, Colon"
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        try {
            const res = await fetch(`${URL}/api/Virastar/PunctuationRestoration`, requestOptions);
            const result = await res.text();
            setPuncText(result);
        } catch (error) {
            console.error('Error in punc:', error);
        }

    }
    
    
  return (
      <>
        <NavBar/>
        <UpBox errorFinding={errorFinding} setErrorFinding={setErrorFinding} punctuation={punctuation} setPunctuation={setPunctuation}/>
        <Main>
        <TextArea text={text} setText={setText} token={token} />
        <TextEdited>
            {errorFinding === true ? <TextWithPopover textEdited={textEdited} setTextEdited={setTextEdited}/> : (errorFinding === false && punctuation === true ?
            <TextWithPunctuation puncText={puncText}/> : "")}
        </TextEdited>
        </Main>
      </>
  )
}


function NavBar({children}) {
  return (
      <nav className="navbar">
        {children}
        <p className="logo">✏️ سامانه تحت وب ویراستاری</p>
      </nav>
  );
}

function UpBox({errorFinding, setErrorFinding, punctuation, setPunctuation}) {
    function errorFindingHandler() {
        setErrorFinding(true);
        setPunctuation(false);
    }

    function punctuationHandler() {
        setPunctuation(true);
        setErrorFinding(false);
    }

    return (
        <div className="up-box">
        <span className="up-text">متن ورودی:</span>
        <div className="buttons">
                <button onClick={errorFindingHandler} className={`button errorButton ${errorFinding ? "errorButtonActive" : ""}`}>خطایاب املایی</button>
                <button onClick={punctuationHandler} className={`button puncButton ${punctuation ? "puncButtonActive" : ""}`}>افزودن علائم نگارشی</button>
        </div>
    </div>

    );
}

function TextArea({text, setText}) {
  function changeHandler(event) {
    const textarea = event.target;
    setText(event.target.value);

    textarea.style.height = '30rem';
    textarea.style.height = `${textarea.scrollHeight}px`;

  }

  return (
      <div className="right-container">
        <textarea className="textArea" value={text} onChange={changeHandler}></textarea>
      </div>
  )
}

function TextEdited({children}) {

    return (
      <div className="left-container">
      <div className="textEdited">
        {children}
      </div>
      </div>
  );
}

function TextWithPunctuation({puncText}) {
    return (
        <div>{puncText}</div>
    );
}

function Main({children}) {
  return (
      <main className="main">
        {children}
      </main>
  );
}

export default App;
