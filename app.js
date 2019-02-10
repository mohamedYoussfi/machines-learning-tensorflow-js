var model;
var current_progress=0;
var trainingDataSet=[[0,0,1], [0.5,0.5,0.5], [1,1,0]];
var numInputs=2;
var numOutputs=1;
var numHiddenNodes=5;
var learningRate=0.5;
var epochs=10;
var numIterations=100;
var currentLoss=0;
var duration;
var testDataSet=[];

function defineParams(){
  numIterations=parseInt($('#iterations').val());
  numHiddenNodes=parseInt($('#numberHiddenNodes').val());
  learningRate=parseFloat($('#learningRate').val());
  epochs=parseInt($('#epochs').val());
}
function initParams(){
    $('#iterations').val(numIterations);
    $('#numberHiddenNodes').val(numHiddenNodes);
    $('#learningRate').val(learningRate);
    $('#epochs').val(epochs);

    $tBody=$('#trainigDataSet');
    trainingDataSet.forEach(d=>{
        let $tr=$('<tr>');
        d.forEach(v=>{
            let $td=$('<td>');$td.append(v);
            $tr.append($td);
        });
        $tBody.append($tr);
    });
    var interval = setInterval(function() {
        $("#pb1")
            .css("width", current_progress + "%")
            .attr("aria-valuenow", current_progress)
            .text(current_progress + "% Complete");


        if (current_progress >= 100){
            clearInterval(interval);
        }

    }, 100);

}
$(function() {
    initParams();
});
function createModel(){
    model=tf.sequential();
    // Create the hidden layer
    const hidden=tf.layers.dense({
        units:numHiddenNodes, activation:'sigmoid', inputShape:[numInputs]
    });
// Create the output layer
// Dense mean the fully connected layer
    const output=tf.layers.dense({
        units:numOutputs,
        // in this layer the input shape is infered by the previous layer
        activation:'sigmoid'
    });
// Add layers to model
    model.add(hidden);
    model.add(output);
    let config={
        optimizer:tf.train.sgd(learningRate), // optimize using the stochastic gradient desecnt
        loss:'meanSquaredError' // the meanSquaredError loss function
    }
//compile the model with the  optimze and the loss function
    model.compile(config);
}
async function trainModel(){
// Training the model
    let dataXs=[];
    let dataYs=[];
    trainingDataSet.forEach(d=>{
        dataXs.push([d[0],d[1]]);
        dataYs.push(d[2]);
    })
    const xs=tf.tensor2d(dataXs);
    const ys=tf.tensor1d(dataYs);

    for (let i = 0; i < numIterations; i++) {
        let resp=await model.fit(xs,ys,{epochs:epochs,shuffle:true});
        //console.log(resp.history.loss[0]);
        currentLoss= resp.history.loss[0];
        $('#loss').html(currentLoss.toFixed(4));
        current_progress=i*100/numIterations;
    }
    current_progress=100;

}

function onTrain(){
    console.log("Start Training model....");
    defineParams();
    createModel();
    duration=new Date()
    trainModel().then(()=>{
        duration=new Date()-duration;
        $('#duration').html(duration);
        console.log("model trained");
        $('#btnSave').show();
        $('#divTestModel').hide();
    });

}

function onSaveModel(){
    console.log("Saving the model");
    model.save('localstorage://my-model-1').then((result)=>{
        console.log("model saved in local storage :"+result);
        $('#btnSave').hide();
    });
}

function onTestModel(){
    let x1=parseFloat($('#x1').val());
    let x2=parseFloat($('#x2').val());
    if(!model){
        tf.loadModel('localstorage://my-model-1').then(model=>{
            guess(model,x1,x2);
        });
    }
    else{
        guess(model,x1,x2);
    }
}

function guess(model,x1,x2){
    const xs=tf.tensor2d([[x1,x2]]);
    let result=model.predict(xs);
    console.log(result.data().then(d=>{
        this.testDataSet.push([x1,x2,d[0]]);
        viewData(x1,x2,d[0]);
    }));

}

function viewData(x1,x2,result){
    tr=$('<tr>'); td1=$('<td>');td2=$('<td>');td3=$('<td>');td4=$('<td>');
    btn=$('<button class="btn btn-danger btn-xs" onClick="Corriger(['+x1+','+x2+'])">Corriger</button>');
    td1.append(x1);td2.append(x2);td3.append(result.toFixed(4));
    td4.append(btn);
    tr.append(td1);tr.append(td2);tr.append(td3);tr.append(btn);
    $('#guessResult').append(tr);
}

function onloadModel(){
    tf.loadModel('localstorage://my-model-1').then(model=>{
        this.model=model;
        let config={
            optimizer:tf.train.sgd(learningRate), // optimize using the stochastic gradient desecnt
            loss:'meanSquaredError' // the meanSquaredError loss function
        }
        this.model.compile(config);
        $('#divTestModel').show();
    });
}

async function onDrawChart(x){
    var ctx = document.getElementById("myChart").getContext('2d');
    let labels=[];
    let data=[];
    if(!model){
        model=await tf.loadModel('localstorage://my-model-1');
    }
    for(i=0;i<10;i++){
        if(x==='x1'){
            let x2=parseFloat($('#x2').val());
            const xs=tf.tensor2d([[i,x2]]);
            let result=model.predict(xs);
            labels.push(i);
            let d=await result.data();
            data.push(d[0]);
        }
        else{
            let x1=parseFloat($('#x1').val());
            const xs=tf.tensor2d([[x1,i]]);
            let result=model.predict(xs);
            labels.push(i);
            let d=await result.data();
            data.push(d[0]);
        }
    }
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Output',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
}

function Corriger(data){
    var v=parseFloat(prompt("Valeur de l'expert:"));
    let xs=tf.tensor2d([data],);
    let ys=tf.tensor1d([v]);
    xs.print();
    model.fit(xs,ys,{epochs:epochs,shuffle:true}).then(res=>{
        console.log(res.history.loss[0]);
    });
}

