import './Leaderboard.css';

export default function Leaderboard({headData, bodyData, type}) {

    bodyData.sort(function(a, b) {
        return b.Total - a.Total;
    });

    let cutOff = type === 'Team' ? 3 : 10;
    bodyData = bodyData.slice(0, cutOff);

    return (
      <table>
          <thead>
            <tr>
              <th colSpan={2}>Top {type}s</th>
            </tr>
             <tr>
              {headData.map(heading => {
                return <th key={heading}>{heading}</th>
              })}
            </tr>
          </thead>
          <tbody>
              {bodyData.map((row, index) => {
                  return <tr key={index}>
                      {headData.map((key) => {
                           return <td key={row[key]}>{row[key]}</td>
                      })}
                </tr>;
              })}
          </tbody>
      </table>
   );
   }