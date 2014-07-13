var rows = 50,
	cols = 50,
	totalCells = rows * cols,
	cellSize = 10,
	boardData = [],
	tick = 0,
	paused = true,
	mousedown = false,
	initialPlay = false,
	decay = 'long', decayValue = -100,
	i, j, 
	button, board, cells, 
	run, liveNeighbors, mod, pause, run, setButtonText, toggleCell;
	
for ( i = 0; i < totalCells; i++ ) {
	boardData.push( false );
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
		'width': ( rows * cellSize ) + 'px',
		'height': ( cols * cellSize ) + 'px'
	} );	


cells = board.selectAll( 'div' )
	.data( boardData );
	
cells.enter()
	.append( 'div' )
	.classed( 'cell', true )
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
	
liveNeighbors = function( index ) {
	var count = 0, 
		above = index - cols, 
		below = index + cols;
								
	return ( boardData[ ( ( above - 1 % totalCells ) + totalCells ) % totalCells ] === true ) +
			( boardData[ ( ( above % totalCells ) + totalCells ) % totalCells ] === true ) +
			( boardData[ ( ( above + 1 % totalCells ) + totalCells ) % totalCells ] === true ) +
			( boardData[ ( ( index - 1 % totalCells ) + totalCells ) % totalCells ] === true ) +
			( boardData[ ( ( index + 1 % totalCells ) + totalCells ) % totalCells ] === true ) +
			( boardData[ ( ( below - 1 % totalCells ) + totalCells ) % totalCells ] === true ) +
			( boardData[ ( ( below % totalCells ) + totalCells ) % totalCells ] === true ) +
			( boardData[ ( ( below + 1 % totalCells ) + totalCells ) % totalCells ] === true );   
};
	
run = function() {
	var i, neighbors, newBoard = [], value;		
	
	if ( paused ) {
		return true;
	}
		
	for ( i = 0; i < totalCells; i++ ) {
		neighbors = liveNeighbors( i );
		value = boardData[ i ] === true;
				
		//newBoard.push( !( ( value && ( neighbors < 2 || neighbors > 3 ) ) || ( !value && neighbors !== 3 ) ) );
		newBoard.push( neighbors === 3 || ( ( !value || neighbors === 2 ) && value ) );		
				
		if ( !newBoard[ i ] && decay ) {
			if ( boardData[ i ] < -1 ) {
				newBoard[ i ] = boardData[ i ] + 1;
			}
		
			if ( value ) {
				newBoard[ i ] = decayValue;
			}
		}
	}	
	
	cells.data( boardData = newBoard );	
	
	cells.classed( 'on', function( d ) { return d === true; } );
	
	if ( decay ) {
		cells.attr( 'data-age-' + decay, function( d ) { return ( d < 0 ) ? d - decayValue : false; } );
	}	
};
