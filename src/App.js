import logo from './Logo.png';
import './App.css';
import { PrimaryButton, Stack, Text, DefaultButton, Dialog, DialogType, DialogFooter, Spinner, SpinnerSize, TextField, Checkbox } from '@fluentui/react';
import { useCallback, useEffect, useState, useRef } from 'react';
import ReactCanvasConfetti from 'react-canvas-confetti';
import { HubConnectionBuilder } from '@microsoft/signalr';

const data = [
  '✈️ Free 🌟', 'Pleasing', 'Lovely scenery 🏔️', 'Willy waving', 'Flamingo 🦩', 'Pink ❣️', 'Yetis cabin service manager', "I'm a pilot 🧑‍✈️", 'Airbus', 'Maintenance required 🔧',
  'The Lullaby trust will not be happy with that ❌', 'The Lullaby trust will be happy with that ☑️', 'Simfest ATC truck', 'Only on Vatsim', 'Booze Cruise 🍸',
  'Dick in the rear', 'Hot tub 💦', 'An incident has occurred', 'Diplomatic Incident 🚫', 'UMT (Uninvited Male Touching)', 'ALEXA Shut Up 🙊', "Happy 😄",
  "Grumpy 😠", 'Give Away', 'Raid', 'simfestprizes@gmail.com', 'That smells awful ☣️', 'GET OUT', 'Pass the QRH', "Horgy's height 📏", "Go-around 🛫", "Hold 🔁",
  "Pot of pleasure, Urn of joy", "This is nice", "Simon Kelsey Brief", "Smug look 😏", "Someone is doing that", "Butter 🧈", "Floater 🛬", "Blindfolded landing 🧑‍🦯",
  'A playing of "don\'t show keith (or chat) your teeth"', 'Flaggpunsh 🍶', 'How much the Sim cost? 💸', 'Nothing to see here 🙈', 'Are you using MSFS?', 'Pardon ⁉️', 'Cabin Phone Call',
  'Has anyone checked the wings for ice? ❄️', 'Fatal Damage 💥', 'Throffy coffee ☕', 'Someone can\'t see/no contacts', 'Beep Beep Beep', 'What can Horgy reach',
  'Moist ☔', 'Merch Daddy 🎁👴', 'Muff 🙊', 'Give-away Daddy 🎁', 'Has Horgy finished his sim yet? ⏲️', 'Importing/exporting metal tubes ↔️', 'Horgy sound board 🗣️',
  "We've broken someone", 'Anti-Faff', 'Faff', 'VRB ⚡'
];

function App() {
  const [grid, setGrid] = useState([]);
  const [gameId, setGameId] = useState(0);
  const [ignore, setIgnore] = useState(false);
  const [adminWin, setAdminWin] = useState(null);
  const confettiRef = useRef(null);
  const rows = 5;
  const cols = 5;
  const [connection, setConnection] = useState(null);
  const [verifiedWinner, setVerified] = useState(0);
  const [twitch, setTwitch] = useState("");
  const gridRef = useRef();
  gridRef.current = grid;

  const fillGrid = useCallback(() => {
    setGameId(Math.round(new Date().getTime() / 3600000));
    setIgnore(false);
    setVerified(0);
    if (window.location.pathname === '/admin') {
      setGrid(data.slice(1).map((_d, _i) => ({ id: _i + 1, checked: false })));
      if (connection && connection.connectionStarted) {
        try {
          connection.invoke("SendNewGame");
        }
        catch (e) {
          console.log(e);
        }
      }
    } else {
      let g = new Array(rows).fill(0).map(() => new Array(cols).fill(0));
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          let repeat = true;
          if (x === 2 && y === 2) g[y][x] = { id: 0, checked: true };
          else while (repeat) {
            const _i = Math.round(Math.random() * (data.length - 1));
            if (_i !== 0 && g.filter(_y => _y.filter(_x => _x.id === _i).length > 0).length === 0) { repeat = false; g[y][x] = { id: _i, checked: false }; }
          }
        }
      setGrid(g);
    }
  }, [connection]);

  useEffect(() => {
    if (!connection) {
      const newConnection = new HubConnectionBuilder().withUrl('https://simfest-bingo-backend.azurewebsites.net/hub').withAutomaticReconnect().build();
      setConnection(newConnection);
    }
    fillGrid();
    return () => { if (connection && connection.connectionStarted) connection.connection.hub.stop(); };
  }, [connection, fillGrid]);

  const isWinnerCheck = useCallback((isWinner) => {
    let counter = 0;
    isWinner.ids.filter(_id => _id > 0).forEach(_id => { if (gridRef.current[_id - 1].checked) counter++; });
    console.log("check winner", isWinner, counter > 3, counter);
    if (counter > 3) {
      connection.invoke('Winner', isWinner.connectionId);
      setAdminWin(isWinner);
      alert(`${isWinner.name} has won, please start a new game`);
    } else connection.invoke("NotWinner", isWinner.connectionId);
  }, [connection, gridRef]);

  useEffect(() => {
    if (connection && !connection.connectionStarted) {
      connection.start()
        .then(result => {

          if (window.location.pathname !== '/admin') {
            connection.on('NewGame', () => {
              alert("We are starting a new game");
              fillGrid();
            });
            connection.on("Winner", () => setVerified(2));
            connection.on("NotWinner", () => setVerified(3));
          } else connection.on('IsWinner', isWinner => isWinnerCheck(isWinner));

        })
        .catch(e => console.error('Connection failed: ', e));
    }
  }, [connection, isWinnerCheck, fillGrid]);

  const check = (x, y) => {
    if (x === 2 && y === 2) return;
    let g = [...grid];
    g[y][x].checked = !g[y][x].checked;
    setGrid(g);
    setIgnore(false);
  }

  const adminCheck = (id, checked) => {
    let g = [...grid];
    g[id - 1].checked = checked;
    setGrid(g);
  }

  const checkBingo = () => {
    const isColChecked = () => {
      for (let x = 0; x < cols; x++) {
        if (grid.filter(_r => _r[x].checked).length === rows) return true;
      }
      return false;
    }
    return grid.filter(_r => _r.filter(_c => _c.checked).length === cols).length === 1 || isColChecked() || grid.filter((_r, _y) => _r[_y].checked).length === rows || grid.filter((_r, _y) => _r[4 - _y].checked).length === rows;
  }

  const bingo = window.location.pathname === '/admin' ? false : checkBingo();

  const fire = () => {
    let _int = null;
    let counter = 0;
    const nextAnimation = () => {
      const getAnimationSettings = (originXA, originXB) => {
        const randomInRange = (min, max) => { return Math.random() * (max - min) + min; }
        return { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0, particleCount: 150, origin: { x: randomInRange(originXA, originXB), y: Math.random() - 0.2 } };
      };
      confettiRef.current.confetti(getAnimationSettings(0.1, 0.3));
      confettiRef.current.confetti(getAnimationSettings(0.7, 0.9));
    }
    const timeout = () => {
      nextAnimation();
      counter++;
      if (counter < 10) _int = setTimeout(timeout, 1000);
      else { clearTimeout(_int); _int = null; }
    }
    timeout();
  }

  let ids = [];
  if (window.location.pathname === '/') grid.forEach(row => row.filter(_c => _c.checked).forEach(col => ids.push(col.id)));

  const checkWin = async () => {
    setVerified(1);
    console.log("trigger send", connection.connectionStarted);
    if (connection.connectionStarted) await connection.invoke('IsWinner', ids, twitch);
    else alert('No connection to server.');
  }

  if (bingo && verifiedWinner === 2 && !ignore) fire();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="Simfest Logo" />
        <Stack>
          <h1>Bingo</h1>
          <PrimaryButton text={window.location.pathname === '/admin' ? "New Game" : "New Card"} onClick={() => fillGrid()} />
        </Stack>
      </header>
      <Text className="Game-ID">Game ID: {gameId}</Text>
      {window.location.pathname === '/admin' &&
        <div style={{ columns: '10vw 3', padding: 5 }}>
          {grid.map(_d => <Checkbox key={_d.id} label={`${_d.id} - ${data[_d.id]}`} checked={_d.checked} onChange={(e, checked) => adminCheck(_d.id, checked)} styles={{ root: { margin: 5 } }} />)}
        </div>
      }
      {adminWin && <Dialog dialogContentProps={{ type: DialogType.largeHeader, title: "Someone has got Bingo" }}>
        <Stack tokens={{ childrenGap: 5 }}>
          <Stack horizontal tokens={{ childrenGap: 5 }}><Text>Winner: </Text><Text>{adminWin.name}</Text></Stack>
          <Text>Winning Phrases</Text>
          {adminWin && adminWin.ids.filter(_id => _id > 0).map(_id => gridRef.current[_id - 1].checked && <Text key={`win${_id}`}>{grid[_id - 1]}</Text>)}
        </Stack>
        <DialogFooter>
          <DefaultButton text="Close" onClick={() => setAdminWin(null)} />
        </DialogFooter>
      </Dialog>}
      {window.location.pathname !== '/admin' && <>
        <Dialog hidden={!bingo || ignore} dialogContentProps={{ type: DialogType.largeHeader, title: "BINGO" }}>
          <Stack tokens={{ childrenGap: 5 }}>
            {verifiedWinner === 0 && <TextField label="Twitch Username" required onChange={(e, newVal) => setTwitch(newVal)} defaultValue={twitch} />}
            {verifiedWinner === 1 && <>
              <span>Please wait while we check you are a winner with an admin</span>
              <span>If you don't get a confirmation then no admin is online</span>
              <Spinner size={SpinnerSize.large} label="Checking win with an admin" />
            </>}
            {verifiedWinner === 2 && <span>BINGO! - Expect a £5 donation in your name</span>}
            {verifiedWinner === 3 && <span>This is not a verified win, sorry</span>}
          </Stack>
          <DialogFooter>
            <DefaultButton text="Close" onClick={() => setIgnore(true)} />
            {verifiedWinner > 1 && <PrimaryButton text="New Card" onClick={() => fillGrid()} />}
            {verifiedWinner === 0 && <PrimaryButton text="Check win" onClick={checkWin} />}
          </DialogFooter>
        </Dialog>
        <ReactCanvasConfetti ref={confettiRef} style={{ position: 'fixed', zIndex: 1000001, pointerEvents: 'none', top: 0, left: 0, width: '100vw', height: '100vh' }} />
        <Stack tokens={{ childrenGap: -1 }} styles={{ alignItems: 'center', justifyContent: 'center' }} >
          {grid.map((row, y) =>
            <Stack horizontal tokens={{ childrenGap: -1 }} key={y} style={{ alignItems: 'center', justifyContent: 'center' }}>
              {row.map((col, x) => <DefaultButton key={`${y}-${x}`} toggle checked={col.checked} onClick={() => check(x, y)} className="Slot">{data[col.id]}</DefaultButton>)}
            </Stack>
          )}
        </Stack>
      </>}
    </div>
  );
}

export default App;
