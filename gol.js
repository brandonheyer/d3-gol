var rows = gol.config.rows,
	cols = gol.config.cols,
	totalCells = rows * cols,
	cellSize = gol.config.cellSize,
	boardData = [],
	tick = 0,
	paused = true,
	mousedown = false,
	initialPlay = false,
	decay = 'long',
	decayValue = -100,
	i, j,
	button, board, cells,
	run, liveNeighbors, mod, pause, run, setButtonText, toggleCell;

for ( i = 0; i < totalCells; i++ ) {
	boardData.push( (Math.random() * 100) < 60 );
	// boardData.push(false);
}

d3.select( 'body' )
	.on( 'mouseup', function() {
		mousedown = false;

		if ( initialPlay ) {
			play();
		}
	} );

button = d3.select( '.run' );
decayButton = d3.select( '.decay' );

board = d3.select( '#board' )
	.style( {
		'height': ( rows * cellSize ) + 'px',
		'width': ( cols * cellSize ) + 'px'
	} );


cells = board.selectAll( 'div' )
	.data( boardData );

cells.enter()
	.append( 'div' )
	.classed( 'cell', true )
	.classed( 'on', function(d) {
		return d;
	} )
	.on( 'mousedown', function( d, i ) {
		mousedown = true;
		pause();
		toggleCell( this, i );
	} )
	.on( 'mouseover', function( d, i ) {
		if ( mousedown ) {
			toggleCell( this, i );
		}
	} );


button.on( 'click', function() {
	initialPlay = !initialPlay;

	if ( paused ) {
		play();
	} else {
		pause();
	}
} );

decayButton.on( 'click', function() {
	var d3Button = d3.select( this );

	switch( d3Button.text() ) {
		case 'No Decay':
			d3Button.text( 'Short Decay' );
			decay = 'short';
			decayValue = -10;
			break;

		case 'Short Decay':
			d3Button.text( 'Long Decay' );
			decay = 'long';
			decayValue = -100;
			cells.attr( 'data-age-short', false );
			break;

		default:
			d3Button.text( 'No Decay' );
			decay = false;
			decayValue = 0;
			cells.attr( 'data-age-long', false );
			break;
	}
} );

toggleCell = function( that, i ) {
	boardData[ i ] = !( boardData[ i ] === true );
	d3.select( that )
		.classed( 'on', boardData[ i ] )
		.attr( 'data-age-' + decay, false );
};

setButtonText = function() {
	button.text( paused ? 'Run' : 'Pause' );
};

pause = function() {
	paused = true;
	setButtonText();
};

play = function() {
	paused = false;
	setButtonText();
	d3.timer( run );
};

mod = function( n, m ) {
	return ( ( m % n ) + n ) % n;
};

function getCellAlive(row, col) {
	const cell = boardData[
		(
			(
				mod(rows, row)
			) * cols
		) + (
			mod(cols, col)
		)
	];

	return cell === true;
}

liveNeighbors = function( index ) {
	var row = index === 0 ? 0 : Math.floor(index / cols);
	var column = index % cols;

	return (
		getCellAlive(row - 1, column - 1) +
		getCellAlive(row - 1, column) +
		getCellAlive(row - 1, column + 1) +
		getCellAlive(row, column - 1) +
		getCellAlive(row, column + 1) +
		getCellAlive(row + 1, column - 1) +
		getCellAlive(row + 1, column) +
		getCellAlive(row + 1, column + 1)
	);
};

run = function() {
	var i, neighbors, newBoard = [], value;

	newBoard.length = boardData.length;

	if ( paused ) {
		return true;
	}

	for (i = 0; i < totalCells; i++) {
		neighbors = liveNeighbors(i);

		if (boardData[i] === true) {
			if (neighbors < 2) {
				newBoard[i] = decayValue;
			}
			else if (neighbors > 3) {
				newBoard[i] = decayValue;
			}
			else {
				newBoard[i] = true;
			}
		}
		else {
			if (neighbors === 3) {
				newBoard[i] = true;
			}
			else {
				newBoard[i] = boardData[i];
			}
		}
	}

	for (i = 0; i < totalCells; i++) {
		if (newBoard[i] < 0 && decay) {
			boardData[i] = newBoard[i] + 1;
		}
		else if (newBoard[i] < 0) {
			boardData[i] = false;
		}
		else {
			boardData[i] = newBoard[i];
		}
	}

	cells.data(boardData);

	cells.classed( 'on', function( d ) { return d === true; } );

	if ( decay ) {
		cells.attr( 'data-age-' + decay, function( d ) { return ( d < 0 ) ? d - decayValue : false; } );
	}
};
