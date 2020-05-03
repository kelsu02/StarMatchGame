const StarsDisplay = props => (
    <React.Fragment>
        {utils.range(1, props.count).map(starId => (
            <div key={starId} className = "star" /> 
        ))}
    </React.Fragment>
);

const PlayNumber = (props) => (
    <button 
        className = "number"
        style = {{ 
            backgroundColor: colors[props.status], 
            color: props.status === "available" ? "black" : "white"
        }}
        onClick = {() => props.onClick(props.number, props.status)}
    >
        {props.number}
    </button> 
);

const PlayAgain = (props) => (
    <div className = "game-done">
        <div 
            className = "message"
            style = {{ color: props.gameStatus === "lost" ? colors.wrong : colors.used }}
        >
            {props.gameStatus === "lost" ? "Game Over" : "Great Job!\nYou Won!"}
        </div>
        <button onClick = {props.onClick} className = "play-button">Play Again</button>
    </div>
);

const useGameState = timeLimit => {
    const [stars, setStars] = React.useState(utils.random(1,9));
    const [availableNums, setAvailableNums] = React.useState(utils.range(1,9));
    const [candidateNums, setCandidateNums] = React.useState([]);
    const [secondsLeft, setSecondsLeft] = React.useState(10);
    
    React.useEffect(() => {
        if (secondsLeft > 0 && availableNums.length > 0) {
            const timerId = setTimeout(() => setSecondsLeft(secondsLeft -1), 1000);
    
            return () => clearTimeout(timerId);
        }
    });

    const setGameState = (newCandidateNums) => {
        if (utils.sum(newCandidateNums) !== stars) {
            setCandidateNums(newCandidateNums)
        } else {
            const newAvailableNums = availableNums.filter( n => !newCandidateNums.includes(n));
            setStars(utils.randomSumIn(newAvailableNums, 9));
            setAvailableNums(newAvailableNums);
            setCandidateNums([]);
        }
    };

    return { stars, availableNums, candidateNums, secondsLeft, setGameState }
};

const Game = (props) => {
    const {
        stars,
        availableNums,
        candidateNums,
        secondsLeft,
        setGameState,
    } = useGameState();

    const candidatesAreWrong = utils.sum(candidateNums) > stars;
    const gameStatus = availableNums.length === 0
        ? 'won'
        : secondsLeft === 0 ? 'lost' : 'active';

    const numberStatus = (number) => {
        if(!availableNums.includes(number)) {
            return 'used';
        }
        if (candidateNums.includes(number)) {
            return candidatesAreWrong ? 'wrong' : 'candidate';
        }
        return 'available';
    }

    const onNumberClick = (number, currentStatus) => {
        if (gameStatus !== 'active' || currentStatus === 'used') {
            return;
        }

        const newCandidateNums = currentStatus === 'available' ? candidateNums.concat(number) : candidateNums.filter(cn => cn !== number);
    
        setGameState(newCandidateNums);
    };

    return (
        <div className = "game">
            <div className = "help">
                Pick 1 or more numbers that sum to the number of stars
            </div>
            <div className = "body">
                <div className = "left">
                    { gameStatus !== 'active' ? (<PlayAgain onClick = {props.startNewGame} gameStatus = {gameStatus}/>) :( <StarsDisplay count = {stars} /> )}
                </div>
                <div className = "right" >
                    {utils.range(1, 9).map(number => 
                        <PlayNumber 
                            key = {number} 
                            status = {numberStatus(number)}
                            number = {number} 
                            onClick = {onNumberClick}
                        /> 
                    )}
                </div>
            </div>
            <div className="timer" >Time Remaining: {secondsLeft}</div>
        </div>
    )
}

const StarMatch = () => {
    const [gameId, setGameId] = React.useState(1);
    return <Game key = {gameId} startNewGame = {() => setGameId(gameId +1)}/>;
};

//Color Theme
const colors = {
    available: '#EDDEA4',
    used: '#3BB273',
    wrong: '#ff6161',
    candidate: '#4D9DE0',
};

//Math Science
const utils = {
    sum: (arr) => arr.reduce((acc, cur) => acc + cur, 0),
    range: (min, max) => Array.from({length: max - min + 1 }, (_, i) => min + i),
    random: (min, max) => min + Math.floor(Math.random() * (max - min + 1)),
    randomSumIn: (arr, max) => {
        const sets = [[]];
        const sums = [];
        for (let i = 0; i < arr.length; i++){
            for (let k = 0, len = sets.length; k < len; k++) {
                const candidateSet = sets[k].concat(arr[i]);
                const candidateSum = utils.sum(candidateSet);
                if (candidateSum <= max) {
                    sets.push(candidateSet);
                    sums.push(candidateSum);
                }
            }
        }
        return sums[utils.random(0, sums.length - 1)];
    },
};

ReactDOM.render(
    <StarMatch />,
    document.getElementById("App"),
)