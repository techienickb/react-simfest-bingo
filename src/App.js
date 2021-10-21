import logo from './Logo.png';
import './App.css';
import { MessageBar, PrimaryButton, MessageBarType, Stack, Text, DefaultButton, Dialog, DialogType, DialogFooter } from '@fluentui/react';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { useCallback, useEffect, useState } from 'react';

function App() {
  initializeIcons();
  const [grid, setGrid] = useState([]);
  const [gameId, setGameId] = useState(0);
  const [ignore, setIgnore] = useState(false);
  const rows = 5;
  const cols = 5;
  const data = [
    '✈️ Free 🌟', 'Pleasing', 'Lovely scenery 🏔️', 'Willy waving', 'Flamingo 🦩', 'Pink ❣️', 'Vetis cabin service manager', "I'm a pilot 🧑‍✈️", 'Airbus', 'Maintenance required 🔧',
    'The Lullaby trust will not be happy with that', 'The Lullaby trust will be happy with that', 'Simfest atc truck', 'Only on Vatsim', 'Booze Cruise 🍸',
    'Dick in the rear', 'Hot tub 💦', 'An incident has occurred', 'Diplomatic Incident 🚫', 'UMT (Uninvited Male Touching)', 'ALEXA Shut Up 🙊', "Benny's Happy 😄",
    "Benny's Grumpy 😠", 'Give Away', "PSX issue (if you get this I'm sorry)", 'Raid', 'simfestprizes@gmail.com', 'Gary that smells awful ☣️', 'GET OUT', 
    "Horgy's height 📏", "Go-around 🛫", "Hold 🔁", "Pot of pleasure, Urn of joy", "This is nice", "Simon Kelsey Brief", "Smug look 😏", "Simon is doing that",
    "The RIM 🕳️", "Butter 🧈", "The litter picker landing 🛬", "Blindfolded landing 🧑‍🦯", 'A playing of "don\'t show keith (or chat) your teeth"', 'Flaggpunsh 🍶',
    'How much the Sim cost? 💸', 'Nothing to see here 🙈', 'Are you using MSFS?', 'Pardon ⁉️', 'Cabin Phone Call'
  ];
  const fillGrid = useCallback(() => {
    setGameId(Math.round(new Date().getTime() / 900000));
    setIgnore(false);
    let g = new Array(rows).fill(0).map(() => new Array(cols).fill(0));
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        let repeat = true;
        if (x === 2 && y === 2) g[y][x] = { id: 0, checked: true};
        else while (repeat) {
          const _i = Math.round(Math.random() * (data.length - 1));
          if (_i !== 0 && g.filter(_y => _y.filter(_x => _x.id === _i).length > 0).length === 0) { repeat = false; g[y][x] = { id: _i, checked: false}; }
        }
      }
    setGrid(g);
  }, [data.length]);

  useEffect(() => {
    fillGrid();
  }, [fillGrid]);

  const check = (x, y) => {
    if (x === 2 && y === 2) return;
    let g = [...grid ];
    g[y][x].checked = !g[y][x].checked
    setGrid(g);
    setIgnore(false);
  }

  const isColChecked = () => {
    for (let x = 0; x < cols; x++) {
      if (grid.filter(_r => _r[x].checked).length === rows) return true;
    }
    return false;
  }

  const bingo = grid.filter(_r => _r.filter(_c => _c.checked).length === cols).length === 1 || isColChecked() || grid.filter((_r, _y) => _r[_y].checked).length === rows || grid.filter((_r, _y) => _r[4-_y].checked).length === rows;

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="Simfest Logo" />
        <Stack>
          <h1>Bingo</h1>
          <PrimaryButton text="New Bingo Card" onClick={() => fillGrid()} />
        </Stack>
      </header>
      <div className="App-body">
        <MessageBar messageBarType={MessageBarType.severeWarning} style={{fontSize: 'calc(14px + 0.4vmin)' }}>Make sure the game id is active on stream</MessageBar>
        <Text className="Game-ID">Game ID: {gameId}</Text>
      </div>
      <Dialog hidden={!bingo || ignore} dialogContentProps={{ type: DialogType.largeHeader, title: "BINGO" }}>
        Make sure you tell techienick on stream.<br />He will check the options and confirm
        <DialogFooter>
          <DefaultButton text="Close" onClick={() => setIgnore(true) } />
          <PrimaryButton text="New Bingo Card" onClick={() => fillGrid()} />
        </DialogFooter>
      </Dialog>
      <Stack tokens={{childrenGap: -1}} styles={{ alignItems: 'center', justifyContent: 'center' }} >
        {grid.map((row, y) => 
          <Stack horizontal tokens={{childrenGap: -1}} key={y} style={{ alignItems: 'center', justifyContent: 'center' }}>
            {row.map((col, x) => <DefaultButton key={`${y}-${x}`} toggle checked={col.checked} onClick={() => check(x, y)} className="Slot">{data[col.id]}</DefaultButton>)}
          </Stack>
        )}
      </Stack>
    </div>
  );
}

export default App;
