
import visaData from "../../data.json";
function Home() {
  return (
    
      <div className="tab-content">
        <table>
          <thead>
            <tr>
              <th>Country</th>
              <th>Visa Requirement</th>
              <th>Duration of Stay</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {visaData.map((item, index) => (
              <tr key={index}>
                <td>{item.country}</td>
                <td>{item.visaRequirement}</td>
                <td>{item.duration}</td>
                <td>{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
  );
}

export default Home;
