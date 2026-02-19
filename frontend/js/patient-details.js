document.addEventListener("DOMContentLoaded",()=>{

const urlParams = new URLSearchParams(window.location.search)

const patientID   = urlParams.get("id")
const patientName = urlParams.get("name")

document.getElementById("p-name").innerText = patientName
document.getElementById("p-id").innerText   = "ID : " + patientID

const API = "http://127.0.0.1:8000/auto_stream"

const hr    = document.getElementById("val-hr")
const spo2  = document.getElementById("val-spo2")
const bp    = document.getElementById("val-bp")
const resp  = document.getElementById("val-resp")
const temp  = document.getElementById("val-temp")
const oxygen= document.getElementById("val-win")
const gcs   = document.getElementById("val-gcs")
const news  = document.getElementById("val-news")
const time  = document.getElementById("live-time")

const ctx = document.getElementById("newsChart").getContext("2d")

const newsChart = new Chart(ctx,{
    type:"line",
    data:{
        labels:[],
        datasets:[{
            label:"NEWS Score",
            data:[],
            tension:0.4
        }]
    },
    options:{
        responsive:true,
        maintainAspectRatio:false
    }
})

async function fetchVitals(){

    const token = localStorage.getItem("token")

    const res = await fetch(API,{
        headers:{
            Authorization:"Bearer "+token
        }
    })

    const data = await res.json()

    if(data.status) return

    hr.innerText    = data.hr
    spo2.innerText  = data.spo2
    bp.innerText    = data.bp
    resp.innerText  = data.resp
    temp.innerText  = data.temp
    oxygen.innerText= data.oxygen
    gcs.innerText   = data.gcs
    news.innerText  = data.news
    time.innerText  = "Live Sync : "+data.time

    newsChart.data.labels.push(data.time)
    newsChart.data.datasets[0].data.push(data.news)

    if(newsChart.data.labels.length>20){
        newsChart.data.labels.shift()
        newsChart.data.datasets[0].data.shift()
    }

    newsChart.update()
}

setInterval(fetchVitals,2000)

document.getElementById("export-btn").onclick=()=>{
    window.open("http://127.0.0.1:8000/export_csv")
}

})
