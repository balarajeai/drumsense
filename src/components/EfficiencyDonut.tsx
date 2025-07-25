import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

interface EfficiencyDonutProps {
  efficiency: number;
}

export default function EfficiencyDonut({ efficiency }: EfficiencyDonutProps) {
  const percentage = efficiency * 100;
  
  const data = {
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: [
          percentage >= 80 ? '#34D399' : // green for >= 80%
          percentage >= 60 ? '#FBBF24' : // yellow for >= 60%
          '#F87171', // red for < 60%
          '#4B5563' // lighter gray background for remaining
        ],
        borderWidth: 0,
        circumference: 360,
        rotation: -90
      }
    ]
  };

  const options = {
    cutout: '75%',
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      tooltip: {
        enabled: false
      }
    }
  };

  return (
    <div className="relative w-32 h-32">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-2xl font-bold ${
          percentage >= 80 ? 'text-green-400' :
          percentage >= 60 ? 'text-yellow-400' : 
          'text-red-400'
        }`}>
          {percentage.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
