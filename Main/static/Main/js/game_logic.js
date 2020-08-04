const canvas = document.getElementById("canvas")
const ctx = canvas.getContext('2d')
const main_menu = document.getElementById("main_menu");


//constant variables for the game that function as settings
const blk_width = 20
const blk_height = 20
const snake_initial_length = 1;
const easy_interval = 80
const medium_interval = 60
const hard_interval = 40

var interval_duration = hard_interval


//controll variables
var direction = "L"
var blocks = []
var difficulty = "easy";
var interval;
var score;


var snake
var token
var token_hit;


// deque data structure to model the snake body
//it does so by removing the tail of the snake body and adding a new head to the snake
//according to the current direction of the snake movment
class deque { 

    constructor() {

        this.length = 0
        this.capacity = 10
        this.data = []

        for (let i = 0; i < 10; ++i) this.data.push(undefined)

        this.head = this.tail = -1

    }


    grow() {

        var new_data = []
        var new_cap = this.capacity * 2;

        for (let i = 0; i < new_cap; ++i) new_data.push(undefined)

        for (let i = 0; i < this.length; ++i)
            new_data[i] = this.data[(i + this.tail) % this.capacity];

        this.data = new_data
        this.capacity = new_cap
        this.head = this.length - 1
        this.tail = 0
    }


    insert_head(element) {

        if (this.length == this.capacity)
            this.grow()

        if (this.head == this.capacity - 1) {
            this.head = 0
        } else {
            this.head++
        }


        this.data[this.head] = element;
        this.length++;

        if (this.length == 1) {
            this.tail = this.head
        }
    }

    insert_tail(element) {

        if (this.length == this.capacity) {
            this.grow()
        }

        if (this.tail <= 0) { this.tail = this.capacity - 1 } else { this.tail-- }

        this.data[this.tail] = element
        this.length++;

        if (this.length == 1)
            this.head = this.tail;
    }

    pop_head() {

        if (this.length == 0) return null

        if (this.length == 1) {

            let el = this.data[this.head]
            this.data[this.head] = undefined
            this.head = this.tail = -1
            this.length--;
            return el
        }

        if (this.head == 0) {

            let el = this.data[this.head]
            this.data[this.head] = undefined
            this.head = this.capacity - 1
            this.length--;
            return el
        }

        let el = this.data[this.head]
        this.data[this.head] = undefined
        this.head--;
        this.length--;
        return el
    }


    pop_tail() {


        if (this.length == 0) return null

        if (this.length == 1) {

            let el = this.data[this.tail]
            this.data[this.tail] = undefined
            this.head = this.tail = -1
            this.length--;
            return el
        }

        if (this.tail == this.capacity - 1) {

            let el = this.data[this.tail]
            this.data[this.tail] = undefined
            this.tail = 0
            this.length--;
            return el
        }

        let el = this.data[this.tail]
        this.data[this.tail] = undefined
        this.tail++;
        this.length--;
        return el
    }


    head_element() {

        if (this.length == 0) return null;
        return { head: this.data[this.head], index: this.head }
    }

    tail_element() {

        if (this.length == 0) return null;
        return { tail: this.data[this.tail], index: this.tail }
    }
}




//this function is responsible for drawing the snake according to the current direction of the snake
function draw_snake() {

    let head = snake.head_element().head
    let new_y, new_x;
    switch (direction) {

        case "T":

            new_y = head.y - blk_height >= 0 ? head.y - blk_height : canvas.height - blk_height;

            snake.insert_head({ x: head.x, y: new_y })
            break;

        case "R":

            new_x = head.x + blk_width <= canvas.width - blk_width ? head.x + blk_width : 0;

            snake.insert_head({ x: new_x, y: head.y })
            break;

        case "B":

            new_y = head.y + blk_height <= canvas.height - blk_height ? head.y + blk_height : 0;

            snake.insert_head({ x: head.x, y: new_y })
            break;

        case "L":

            new_x = head.x - blk_width >= 0 ? head.x - blk_width : canvas.width - blk_width;

            snake.insert_head({ x: new_x, y: head.y })
            break;
    }

    //

    snake.data.forEach(block => {

        if (block == undefined) return

        ctx.beginPath()
        ctx.rect(block.x, block.y, blk_width, blk_height)
        ctx.fillStyle = snake.head_element().x == block.x && snake.head_element().y == block.y ? "#745296" : "#8B9EB7";
        ctx.fill()
        ctx.closePath()

    });
}

//this function draws the token on the screen at a random location
//#NOTE: The location is neither in the body of the snake nor is it at a block location
function draw_token() {

    let x = token_hit ? Math.floor(Math.random() * (canvas.width / 20)) * 20 : token.x;
    let y = token_hit ? Math.floor(Math.random() * (canvas.height / 20)) * 20 : token.y;

    while (token_hit && (
            snake.data.find(block => (block != undefined && block.x == x && block.y == y)) != undefined ||
            blocks.find(block => block.x == x && block.y == y) != undefined)) {

        x = Math.floor(Math.random() * (canvas.width / 20)) * 20
        y = Math.floor(Math.random() * (canvas.height / 20)) * 20
    }

    ctx.beginPath()
    ctx.rect(x, y, blk_width, blk_height)
    ctx.fillStyle = "#C2E812"
    ctx.fill()
    ctx.closePath()
    token.x = x;
    token.y = y;

}

//this function is responsible for drawing the blocks in medium and hard mode
function draw_blocks() {

    blocks.forEach(block => {

        ctx.beginPath()
        ctx.rect(block.x, block.y, blk_width, blk_height)
        ctx.fillStyle = "#808080";
        ctx.fill()
        ctx.closePath()

    })


}

//this functions is responsible for drawing the player's score at the top left corner of the screen 
function draw_score() {

    ctx.font = "18px Arial"
    ctx.fillStyle = "#0095DD"
    ctx.fillText("Score: " + score, 8, 20);

}

//this function detects the key presses of the user and change the direction of the snake movment accordingly
function key_handler(event) {

    switch (event.key) {

        case "Right":
        case "ArrowRight":
            direction = direction != "L" ? 'R' : 'L'
            break;


        case "Left":
        case "ArrowLeft":
            direction = direction != "R" ? 'L' : 'R'
            break;

        case "Top":
        case "ArrowUp":
            direction = direction != "B" ? 'T' : 'B'
            break;

        case "Bottom":
        case "ArrowDown":
            direction = direction != "T" ? 'B' : 'T'
            break;
    }

}

//this function fires when the player lose the game
//and initilaize the end game screen
function finish_game() {

    let end_game_menu = document.getElementById("end_game")
    end_game_menu.style.visibility = "visible"
    clearInterval(interval)

}

//check the collision of the snake body with itself,
//with the snake and any of the blocks 
//with the snake body and the token
function check_collision() {

    let head = snake.head_element()

    for (let i = 0; i < snake.length; ++i) {


        if (snake.data[i] == undefined || i == head.index)
            continue;

        //check if the head of the snake hit it's body
        if (head.head.x == snake.data[i].x && head.head.y == snake.data[i].y) 
            finish_game()

        
    }

    for (let i = 0; i < blocks.length; ++i) {

        //check if the head of the snake hit a block
        if (head.head.x == blocks[i].x && head.head.y == blocks[i].y) 
            finish_game()
        
    }

    // check if the snake hit the token
    if (token.x == head.head.x && token.y == head.head.y)
        token_hit = true;

}



//initialize the easy difficulty map by setting the interval #NOTE: There are no blocks in easy mode
function initilaize_easy_difficulty_settings() {

    interval_duration = easy_interval;
    blocks = []
}




//initialize setting of the medium difficulty map by adding blocks and setting the interval 
function initilaize_medium_difficulty_settings() {

    interval_duration = medium_interval;

    blocks = []

    for (let i = 15; i <= 30; ++i)
        blocks.push({ x: blk_width * i, y: 0 })


    for (let i = 35; i < 50; ++i)
        blocks.push({ x: 0, y: blk_height * i })

    for (let i = 30; i <= 40; ++i)
        blocks.push({ x: blk_width * i, y: 200 })

    for (let i = 30; i <= 40; ++i)
        blocks.push({ x: 240, y: i * blk_height })

}



//initialize setting of the hard difficulty map by adding blocks and setting the interval 
function initilaize_hard_difficulty_settings() {

    interval_duration = hard_interval;

    blocks = []

    for (let i = 0; i <= 49; ++i) {
        blocks.push({ x: i * blk_width, y: 0 });
        blocks.push({ x: 0, y: i * blk_height })
    }

    for (let i = 5; i <= 30; ++i)
        blocks.push({ x: i * blk_width, y: 600 })
    for (let i = 33; i <= 47; ++i)
        blocks.push({ x: i * blk_width, y: 600 })

    for (let i = 36; i <= 45; ++i)
        blocks.push({ x: blk_width * i, y: 460 })

    for (let i = 38; i <= 45; ++i)
        blocks.push({ x: blk_width * i, y: 400 })

    for (let i = 200; i <= 400; i += 20)
        blocks.push({ x: 38 * blk_width, y: i })

    for (let i = 200; i <= 460; i += 20)
        blocks.push({ x: 35 * blk_width, y: i })

}



//main drawing function
function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw_score()
    draw_blocks()

    draw_snake()
    check_collision();
    draw_token()

    if (!token_hit)
        snake.pop_tail()

    else {
        token_hit = false;
        score += 10
    }
}


function get_difficulty() {

    let choices = document.getElementsByName("difficulty")
    for (let i = 0; i < choices.length; ++i) {
        if (choices[i].checked == true) {

            difficulty = choices[i].value;
            break;
        }
    }

}


function start_game() {

    snake = new deque()
    token = { x: 0, y: 0 }
    token_hit = true;
    direction = 'L'

    for (let i = 0; i < snake_initial_length; ++i)
        snake.insert_head({ x: 280 - blk_width * i, y: 160 })

    score = -10
    get_difficulty()
    main_menu.style.visibility = "hidden"
    document.getElementById("end_game").style.visibility = "hidden"

    switch (difficulty) {

        case "easy":
            initilaize_easy_difficulty_settings()
            break

        case "medium":
            initilaize_medium_difficulty_settings()
            break

        case "hard":
            initilaize_hard_difficulty_settings()
            break

        default:
            initilaize_easy_difficulty_settings()
            break
    }

    interval = setInterval(draw, interval_duration)

}


document.addEventListener("keydown", key_handler, false)