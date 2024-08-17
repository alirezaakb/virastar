import {useEffect, useState} from 'react'

const KEY = 'cdf3da1a-7459-ef11-af60-00163e6496fc';
const URL = 'https://api.text-mining.ir';
function App() {

  const [token, setToken] = useState("");
  const [text, setText] = useState("");

    useEffect(() => {
      async function fetchToken(){
        const tokenObject = await fetch(`${URL}/api/Token/GetToken?apikey=${KEY}`);
        const data = await tokenObject.json();
        setToken(data.token);
      }
      fetchToken();
    }, []);

  console.log(token)
  function langDetect(token, text) {

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Accept", "text/plain");
    myHeaders.append("Authorization", `Bearer ${token}`);

    const raw = JSON.stringify(text);
    
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch(`${URL}/api/LanguageDetection/Predict`, requestOptions)
        .then((response) => response.text())
        .then((result) => console.log(result))
        .catch((error) => console.error(error));
  }
  
  function textNormalize(token, text) {

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

    fetch(`${URL}/api/PreProcessing/LightNormalizePersianWord`, requestOptions)
        .then((response) => response.text())
        .then((result) => console.log(result))
        .catch((error) => console.error(error));

  }

function clickHandler() {
  langDetect(token,text)
  textNormalize(token,text)
}



  return (
      <>
        <TextArea text={text} setText={setText} />
        <button onClick={clickHandler}/>
      </>
  )
}

function TextArea({text, setText}) {
  const handleChange = (event) => {
    setText(event.target.value);
  };

  return (
      <textarea value={text} onChange={handleChange}></textarea>
  )
}


export default App;
