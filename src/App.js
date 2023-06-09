import './App.css';
import { useState } from 'react';
import html2canvas from 'html2canvas'
import { jsPDF } from "jspdf";
import Papa from 'papaparse';
import ProgressBar from "@ramonak/react-progress-bar";

import Individual from './resources/individual.png';
import Team from './resources/team.png';
import Globe from './resources/globe.png';
import Leaderboard from './Leaderboard';

function convert(event, setData) {
  const data = [];

  const files = event.target.files;
  if (files) {
    Papa.parse(files[0], {
      header: true,
      complete: function (results) {
        results.data.forEach(result => {
          delete result.Timestamp;

          for (let item in result)
            if (result[item] === '')
              delete result[item];

          const alreadyExists = data.some(el => el.Name === result.Name);
          if (!alreadyExists) {
            data.push(result);
          } else {
            const index = data.findIndex(item => item.Name === result.Name);
            for (let item in result) {
              if (data[index][item] !== result[item]) {
                data[index][item] = result[item]
              }
            }
          }

          data.forEach(entry => {
            const stepKeys = Object.keys(entry).filter((key) => /Steps/.test(key));
            let total = 0;
            for (const key of stepKeys) {
              total += parseInt(entry[key]);
            }
            entry['Total'] = total;
          })

          setData(data)
        })
      }
    })
  }
}

function generate() {
  html2canvas(document.querySelector('.outer')).then(canvas => {
    var pdf = new jsPDF("l", "px", [1000, 1800]);
    var imgData = canvas.toDataURL('image/png');
    var width = pdf.internal.pageSize.getWidth();
    var height = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save('download.pdf');
  });
};

function totalSteps(stepData) {
  let totalSteps = 0;
  for (const entry of stepData) {
    totalSteps += entry.Total;
  }
  return totalSteps
}

function teamSteps(stepData){
  let splitTeamSteps = stepData.reduce(function(teamSteps, x) {
    if (!teamSteps[x['Team']]) { teamSteps[x['Team']] = []; }
    teamSteps[x['Team']].push(x);
    return teamSteps
  }, {});
  
  let teamData = [];
  
  for (const team in splitTeamSteps){
    const selectedTeam = splitTeamSteps[team];
    selectedTeam.push(totalSteps(selectedTeam));
    teamData.push({'Team': team, 'Total': selectedTeam[selectedTeam.length - 1]});
  }

  return teamData;
}

const worldSteps = 131480184;

function App() {
  const [stepData, setStepData] = useState([]);
  return (
    <div>
      <div className='topButtons'>
        {stepData.length === 0 &&
          <input
            type="file"
            accept=".csv"
            onChange={(e) => convert(e, setStepData)}
          />
        }
        {stepData.length !== 0 &&
          <button className='generate' onClick={() => generate()}>Generate PDF</button>
        }
      </div>
      <div className="App">
        {stepData.length === 0 &&
          <span>Please select the data file using the Choose File button above.</span>
        }
        {stepData.length !== 0 &&
          <div className='outer'>
            <div className='inner'>
              <div className='leaderboards'>
                <div className='leaderboard'>
                  <img
                    src={Individual}
                    style={{ height: 120, width: 87 }}
                    alt="Individual Steps" />
                  <Leaderboard headData={['Name', 'Total']} bodyData={stepData}/>
                </div>
                <div className='leaderboard'>
                  <img
                    src={Team}
                    style={{ height: 120, width: 130 }}
                    alt="Team Steps" />
                  <Leaderboard headData={['Team', 'Total']} bodyData={teamSteps(stepData)}/>
                </div>
              </div>
              <div className='globe'>
                <img
                  src={Globe}
                  style={{ height: 150, width: 150 }}
                  alt="Globe" />
              </div>
              <div className='world'>
                <span>Around the World, with {(worldSteps - totalSteps(stepData)).toLocaleString()} Steps to Go!</span>
                <ProgressBar completed={(totalSteps(stepData) / worldSteps) * 100} className='progressbar' bgColor="#e8fc5e" isLabelVisible={false} />
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  );
}

export default App;
