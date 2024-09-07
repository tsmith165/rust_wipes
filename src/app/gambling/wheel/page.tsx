import GamblingWheel from './GamblingWheel';
import RecentWinners from './RecentWinners';

export default function GamblingWheelPage() {
    return (
        <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-3/4">
                <GamblingWheel />
            </div>
            <div className="w-full md:w-1/4">
                <RecentWinners />
            </div>
        </div>
    );
}
