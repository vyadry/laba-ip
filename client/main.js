const startTime = new Date();
const minutesTimer = 30;
var data;
var currentIndex = 0;
let selectedQuestion = 1;
var currentAnswer;
var correctAnswers = 0;
var sortable;

function setTextOfQuestion(text) {
    const textComponent = document.querySelector('#text');
    textComponent.innerHTML=text;
}

async function getData(){
    const data = await fetch('/data');
    const json = await data.json()
    return json;
}

function setSelected(index){
    const questions = document.querySelectorAll('.select-question');
    const answersContainer = document.querySelector('#answers');
    answersContainer.innerHTML='';
    switch(data[index].type){
        case 'normal':
            const input = document.createElement('input');
            input.className = 'input';
            input.onchange = ()=>{
                currentAnswer = input.value;
            }
            answersContainer.appendChild(input);
            break;

        case 'var4':
            data[index].variants.forEach((variant, indexEl)=>{
                const variantEl = document.createElement('div');
                variantEl.onclick = ()=>{
                    const allVariants = document.querySelectorAll('.var4-variant');
                    allVariants.forEach((variant)=>{
                        variant.classList.remove('selected');
                    })
                    variantEl.classList.add('selected')
                    currentAnswer = variant;
                }
                variantEl.classList.add('var4-variant');
                variantEl.innerHTML = variant;
                answersContainer.appendChild(variantEl);
            })
            break;
        case 'sorting':
            data[index].variants.forEach((variant, indexEl)=>{
                const variantEl = document.createElement('div');
                variantEl.classList.add('var4-variant');
                variantEl.setAttribute('data-id', variant)
                variantEl.innerHTML = variant;
                answersContainer.appendChild(variantEl);
            })
            sortable = Sortable.create(answersContainer);
            break;

        case 'matching':
            const matchContainer = document.createElement('div');
            matchContainer.classList.add('matching');
            const changedColumn = document.createElement('div');
            const noChangedColumn = document.createElement('div');

            matchContainer.appendChild(noChangedColumn)
            matchContainer.appendChild(changedColumn)

            data[index].variants.forEach((variant, indexEl)=>{
                const variantEl = document.createElement('div');
                variantEl.classList.add('matching-el');
                variantEl.setAttribute('data-id', variant)
                variantEl.innerHTML = variant;
                changedColumn.appendChild(variantEl);
            })

            data[index].matchedQuestions.forEach((variant, indexEl)=>{
                const variantEl = document.createElement('div');
                variantEl.classList.add('matching-el');
                variantEl.innerHTML = variant;
                noChangedColumn.appendChild(variantEl);
            })
            answersContainer.appendChild(matchContainer);
            sortable = Sortable.create(changedColumn);
            break;

        default:
            answersContainer.innerHTML='';
    }
    setTextOfQuestion(data[index].text);
    currentIndex = index;
    questions.forEach(question=>{
        question.classList.remove('selected');
    })
    questions[index].classList.add('selected')
}

function insertQuestion(){
    const textComponent = document.querySelector('#select-column');

    data.forEach((el, index)=>{
        let ques = document.createElement('div');
        ques.className = 'select-question';
        ques.innerHTML=`Вопрос ${index+1}`
        ques.onclick = ()=>{
                setSelected(index);
        }
        textComponent.appendChild(ques)
    })

}

function setTimer(){
    const timerComponent = document.querySelector('#timer');

    function formatTime(num){
        if (num === 60) return '00'
        if (num < 10) return `0${num}`
        else return num
    }

    function timer(){
        const diff = Math.floor((Date.now() - startTime.getTime()) / 1000);
        const minutes = minutesTimer - Math.ceil(diff/60);
        if (minutes >= 0){
            const seconds = 60 - (diff % 60);
            timerComponent.innerHTML=`${formatTime(minutes)}:${formatTime(seconds)}`;
            setTimeout(()=>{
                timer()
            }, 1000)
        } else{
            alert(`Время вышло! Правильных ответов ${correctAnswers} из ${data.length}`)
        }
    }
    timer();
}

function setButtons(){
    const skipButton = document.querySelector("#skip");
    skipButton.onclick = ()=>{
        if (currentIndex < data.length-1){
            setSelected(currentIndex+1);
        }
    }
    const backButton = document.querySelector("#back");
    backButton.onclick = () => {
        if (currentIndex){
            setSelected(currentIndex-1);
        }
    }
    const answerButton = document.querySelector('#answer-button');
    answerButton.onclick = () => {
        data[currentIndex].resolved = true;
        const questions = document.querySelectorAll('.select-question');
        questions[currentIndex].classList.add('resolved');
        switch(data[currentIndex].type){
            case 'normal':
                if (currentAnswer == data[currentIndex].answer){
                    correctAnswers++
                }
                break;
            case 'var4':
                if (currentAnswer == data[currentIndex].answer){
                    correctAnswers++
                }
                break;
            case 'sorting':
                if (sortable.toArray().join('') === data[currentIndex].answer.join('')){
                    correctAnswers++
                }
                break;
            case 'matching':
                if (sortable.toArray().join('') === data[currentIndex].answer.join('')){
                    correctAnswers++
                }
                break;
        }
        currentAnswer=undefined;
        sortable=undefined;
        if (currentIndex+1<= data.length-1){
            setSelected(currentIndex+1)
        }
    }
    const endButton = document.querySelector("#end");
    endButton.onclick = ()=>{
        alert(`Правильных ответов ${correctAnswers}`)
    }
}

async function main(){
    data = await getData()
    setTimer()
    insertQuestion();
    setSelected(0);
    setButtons();
}
main();