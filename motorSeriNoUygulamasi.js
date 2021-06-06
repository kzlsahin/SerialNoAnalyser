//csv as input: https://code.tutsplus.com/tutorials/parsing-a-csv-file-with-javascript--cms-25626

let letters = ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H', 'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'Q','R', 'S', 'Ş', 'T', 'U', 'Ü', 'W', 'X', 'V', 'Y', 'Z', 'a', 'b', 'c', 'ç', 'd', 'e', 'f', 'g', 'ğ', 'h', 'ı', 'i', 'j', 'k', 'l', 'm','n','o','ö','p', 'q', 'r', 'ş', 's', 't', 'u', 'ü', 'v', 'w', 'x', 'y', 'z'];

let numberLetters = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

let myJSON;

let markalar = {markaAdlari: [],
                   girdiler: [] //{marka: .... , seriNolar : [], motorTiplar: []}
                   };


/*
    output[] : [....{Marka: ..., 
                     formats: [],
                     formatsData:[ {format:"...", counter:Number, serialNumber:["...","...",...], motorTypes:[]}]
                    }
                ]
    */
let output = [];

let filteredResult = {markaDict:[], filteredMarkas:[]};

let filterState = "nonFiltered"

let remainingFormatNumber;

let hasHeaderRow = false;

let dataLoading = false;

let rowCounter = 0;

let numberOfFormats;

function getDataFromFile(){

    let fileSelected = document.getElementById("fileList");
    let fileName = fileSelected.options[fileSelected.selectedIndex].value;
    let informFrame = document.getElementById("informationDiv");
    
    informFrame.style.display = "block";
    
    document.getElementById("information").innerHTML = "Loading... Please Wait..." + "file name: " + fileName;
    //!!!!!debugging amaçlı kısayoldur. Sonradan kaldır!!!!!
    try{
        document.getElementsByTagName("button").disabled = true;
        $.ajax({url: fileName, dataType: 'text'}).done(successFunction).fail(function(){informFrame.style.display = "none"; console.log("couldn't find the file")});
    }
    catch(err) {
        
        console.log(err);
        
        informFrame.style.display = "none";
    }
    
   
}

function markaEkle(row){
    
    if(hasHeaderRow && !dataLoading){
        dataLoading = true;

    }
    
    else {
        
        rowCounter++;
        //marka adlarının çekileceği sütun numarası
        let markaColoumn = document.getElementById("markaStunu").value;

        //seri numaralarının çekileceği sütun numarası
        let seriNoColoumn = document.getElementById("seriNoStunu").value;

        //motor tiplerinin çekileceği sütun numarası
        let motorTipiColoumn = document.getElementById("motorTipiStunu").value;

        let cells = row.split(';');

        let markaAdi = cells[markaColoumn];
        
        let seriNo = cells[seriNoColoumn];

        let motorTipi = cells[motorTipiColoumn];
        
        //if(markaAdi == "") console.log("boş marka. row" + rowCounter + " seri no: " + seriNo);


        if(markalar.markaAdlari.length == 0){

            //first member of the array of markaAdlari
            markalar.markaAdlari[0] = markaAdi;

            // and also define new seriNo object
            markalar.girdiler[0] = {marka: markaAdi, seriNolar: [seriNo], motorTipleri: [motorTipi] }

            } 

        else if (!(markalar.markaAdlari.includes(markaAdi))) {

                // if the markaAdi is not present in the array of markaAdlari add new markaAdi
                markalar.markaAdlari.push(markaAdi);

                // and also define new girdi object {marka: .... , seriNolar : []}
                markalar.girdiler.push({marka: markaAdi, seriNolar: [seriNo], motorTipleri: [motorTipi]});    

            } 

        else if (markalar.markaAdlari.includes(markaAdi)){            
                //if the markaAdi is present int the array of markaAdalari only add the seriNo
                let index = markalar.markaAdlari.indexOf(markaAdi);
                //(lengthOfMarkalar - 1) is the last index of markalar array
                markalar.girdiler[index].seriNolar.push(seriNo);

                //add motorTipi
                markalar.girdiler[index].motorTipleri.push(motorTipi);
            }
    }
    
    
}

function successFunction(data) {
    
    console.log("data query started...");
    
    hasHeaderRow = document.getElementById("headerRow").checked;
    
    rowCounter = 0;
    
    var allRows = data.split(/\r?\n|\r/);
     
    allRows.forEach(row => markaEkle(row));  
    
        myJSON = JSON.stringify(markalar);    
    
    let informFrame = document.getElementById("informationDiv");
    
    try {
                
    generatePatterns(markalar);
    
    informFrame.style.display = "none";
        
    } catch (err){
        
        console.log(err);
        
        informFrame.style.display = "none";
        
        window.alert("data alınamadı");
        
        document.getElementsByTagName("button").disabled = false;
        
    }
    
    dataLoading = false;
    
}

function logFileName(){

    let filePath = document.getElementById("fileSelector").value;

    divededPath = filePath.split("\\");


    return divededPath[divededPath.length-1];
}

function downLoadData(exportingString, exportName, extension){

    let dataStr = "data:text/json;charset=utf-8,"+ encodeURIComponent(exportingString);

    let downLoadAnchorNode = document.createElement('a');

    downLoadAnchorNode.setAttribute("href", dataStr);

    downLoadAnchorNode.setAttribute("download", exportName + extension);

    document.body.appendChild(downLoadAnchorNode);

    downLoadAnchorNode.click();

    downLoadAnchorNode.remove();
}

function exportData(){

    downLoadData(JSON.stringify(markalar), logFilePath(), ".json");
}

function generatePatterns(mainList){
    
    console.log("generating formats");
    /*
    output[] : [....{Marka: ..., 
                     formats: [],
                     formatData:[ {format:"...", counter:Number, serialNumbers:["...","...",...], motorTypes:[]} ]
                    }
                ]
    */
        
    let markaIndex = 0;

    numberOfFormats = 0;

    let addNewFormat = function (pattern, serialNo, motorType, i){

        let formatİndex = output[i].formats.length;

        output[i].formats[formatİndex] = pattern;

        output[i].formatsData[formatİndex] = {format: pattern, counter: 1, serialNumber: [serialNo], motorTypes:[motorType]};

    }

    let addSerialToFormat = function(pattern, serialNo, motorType, i){

        let formatİndex = output[i].formats.indexOf(pattern);

        output[i].formatsData[formatİndex].counter += 1;

        try{
         output[i].formatsData[formatİndex].serialNumber.push(serialNo);
         output[i].formatsData[formatİndex].motorTypes.push(motorType);
        }
        catch(err){
            console.log("pattern: ", pattern);
            console.log(output[i].formatsData);
            console.log(formatIndex);
        }

    }


    let findInFormat = function(formats, pattern){

        let isPresent = false;

        for(format of formats ){

            if(format == pattern){ 

               isPresent = true;

            return isPresent;

            }
        }

        return isPresent;

    }
    
    
    document.getElementById("information").innerHTML = "Generating Formats...";
     /*
    output[] : [....{markaAdi: ..., 
                     formats: [],
                     formatsData:[ {format:"...", counter:Number, serialNumber:["...","...",...], motorTypes:[]} ]
                    }
                ]
    */

    for(markaAdi of mainList.markaAdlari){
        /*
        her bir marka bir indexe karşılık geliyor. Her girdinin içinde o markaya ait serinolar 
        serisi bulunuyor. Bu seri nolar içinde iterasyon yaparak her bir seri no modelini belirleyecek ve her farklı modeli ayrı olarak kaydedecek, mevcut bir model ise o modelin sayacını artıracak
        */
        let pattern;
        
        markaIndex = markalar.markaAdlari.indexOf(markaAdi);
        
        output[markaIndex] = {markaAdi: markaAdi, formats:[], formatsData:[] }
        
        let motorIndex = 0;
        
        for(serialNumber of markalar.girdiler[markaIndex].seriNolar){

            pattern = findPattern(serialNumber);
            
            let motorType = markalar.girdiler[markaIndex].motorTipleri[motorIndex];

            if(output[markaIndex].formats.length == 0){
                               
                output[markaIndex].formats[0] = pattern;

                output[markaIndex].formatsData[0] = {format: pattern, counter: 1, serialNumber: [serialNumber], motorTypes: [motorType]};

                numberOfFormats++;

            } else {

                if(findInFormat(output[markaIndex].formats, pattern)){
                    
                    addSerialToFormat(pattern, serialNumber, motorType, markaIndex);

                } 
                
                if(!findInFormat(output[markaIndex].formats, pattern)){              
                    
                    addNewFormat(pattern, serialNumber, motorType, markaIndex);
                    
                    numberOfFormats++;
                }

            }

            motorIndex++;

        }

        
        
    }
    
    console.log("formatlar oluşturuldu. İşlem tamamlandı");
    
    console.log(numberOfFormats, "total format");
    
    document.getElementsByTagName("button").disabled = false;
    
    showResults();
    
    //downLoadData(JSON.stringify({output}), "output", ".json");
//end of generatePatterns()

}



function findPattern(seriNo){


    let pattern = "";

        if((typeof seriNo) == 'string'){

        for(let index = 0; index < seriNo.length; index++) {

            if(letters.includes(seriNo[index])) pattern += 'a';
            if(numberLetters.includes(seriNo[index])) pattern += '1';
            if(!numberLetters.includes(seriNo[index]) && !letters.includes(seriNo[index])) pattern += seriNo[index]; 
        }
    }
    return pattern;
}

/*_____________________________________________________________*/
//Output Results

function importResults(){
    
}

function exportResultsAsCSV(){
    
    if(!(output == null )){
       
        let data = "marka adi;formatlar;sayisi\n";
        
        for(markaObj of output){
            
            data += "marka adi;" + markaObj.markaAdi + ";\n";
            
            let index = 0;
            
            for(format of markaObj.formats){
                
                data +=";" + format + ";" + markaObj.formatsData[index].counter + "\n";
                index++;
            }
            
        }
        
        downLoadData(data, "sonuclar", ".csv");
       
       } else {
       
       Results.informUser("sonuçlar girilmedi. İmport edin veya yeniden oluşturun");
        
       }
  
    //end of exportResultsAsCSV()
}

function showResults(){
    
     if(!(output == null )){
       
       Results.drawResultLayout();
       
       } else {
       
       Results.informUser("sonuçlar girilmedi. İmport edin veya yeniden oluşturun");
        
       }
}

let Results = {
    
    markaDict: [],
    
    markaList: [],

    results: [],
    
    indexOfSelectedMarka: 0,
    
    mouseX: 0,
    
    mouseY: 0,
    
    informUser: function(msg){

        windows.alert(msg);

        },

    drawResultLayout: function(){

        this.markaList = this.getMarkaList();
        
        this.markaDict = [...this.markaList];
        
        this.setMarkaListLayout();
        
        this.markaSelectorElement = document.getElementById("markaSelection");
        
        this.markaSelectorElement.addEventListener('change', (event) => {Results.reviseIndexOfSelectedMarka();});
        
        this.insertTable(this.indexOfSelectedMarka);
        


     //end of drawRsultlayout()   
    },

    getMarkaList: function(){

        let names = [];
        
        let i = 0;
        for(markaObj of output){
            names[i] = markaObj.markaAdi;
            i++;
        }

        return names;

    },

    setMarkaListLayout: function(){
        
        let selectorInput = document.getElementById("markaSelection");
        
        let option;
        
        this.markaList.sort();
                    
        for(let i = 0; i < this.markaList.length; i++){
            
            option = document.createElement("option");
            
            option.setAttribute("value", this.markaList[i]);
            
            option.innerHTML = this.markaList[i];
            
            selectorInput.appendChild(option);
        }
    },
            
    reviseIndexOfSelectedMarka: function(){
        
        this.indexOfSelectedMarka = this.markaSelectorElement.options.selectedIndex;
        
        this.insertTable(this.indexOfSelectedMarka);
        
    },
        
    insertTable: function(selectedMarkaIndex){
        //find the index of the selected marka in the output data array
        let markaIndex;
        
        //insertin formats as table
        let formats;
        
        switch(filterState){
                
            case "nonFiltered":
                
                markaIndex = this.markaDict.indexOf(this.markaList[selectedMarkaIndex]);
                
                formats = output[markaIndex].formatsData;
                
                break;
                
            case "filtered":
                
                markaIndex = filteredResult.markaDict.indexOf(this.markaList[selectedMarkaIndex]);
                
                formats = filteredResult.filteredMarkas[markaIndex].formats;
                
                break;
                
        }
        
        document.getElementById("formatList").remove();
        
        let table = document.createElement("formatList");
        
        table.setAttribute('id', "formatList");
        
        
        let th1 = document.createElement("th");
        
        let th2 = document.createElement("th");
        
        th1.setAttribute("style", "border:1px solid black;");
        
        th2.setAttribute("style", "border:1px solid black;text-align:center;");
        
        th1.innerHTML = "Formatlar";
        
        th2.innerHTML = "Miktarı";
        
        table.appendChild(th1);
        
        table.appendChild(th2);
        
        for(let i = 0; i < formats.length; i++){
            
            let tr = document.createElement("tr");
            
            let td1 = document.createElement("td");
            
            let td2 = document.createElement("td");
            
            td1.innerHTML = formats[i].format;
            
            td1.setAttribute("class", "format");
            
            td2.innerHTML = formats[i].counter;
            
            td1.setAttribute("style", "border:1px solid black;");
            
            td2.setAttribute("style", "border:1px solid black;text-align:center;");
            
            tr.appendChild(td1);
            
            tr.appendChild(td2);
            
            table.appendChild(tr);
            
        }
        
        table.setAttribute("style", "float:left;border:1px solid black;color:darkred;");
        
        document.getElementById("resultTables").appendChild(table);
        
        document.getElementById("detailTable").remove();
        
       
            
            let detailTable = document.createElement("table");
        
            detailTable.setAttribute("id", "detailTable");
        
            th1 = document.createElement("th");
        
            th2 = document.createElement("th");
        
            th3 = document.createElement("th");
        
            th1.innerHTML = "Formatlar";
        
            th2.innerHTML = "Motor Tipleri";
        
            th3.innerHTML = "Seri Numaralar";
        
            detailTable.appendChild(th1);
        
            detailTable.appendChild(th2);
        
            detailTable.appendChild(th3);
        
            /** DİKKAT!!! Output verisine göre markaIndex burda tekrar değişiyor. 
            ** Dikkat! İlerde burası gözden kaçmasın
            *
            *
            *
            *Dikkat */
            markaIndex = this.markaDict.indexOf(this.markaList[selectedMarkaIndex]);
        
            for(let i = 0; i < output[markaIndex].formats.length; i++){
                
                for(let tipIndex = 0; tipIndex < output[markaIndex].formatsData[i].motorTypes.length; tipIndex++){
                    
                    let tr = document.createElement("tr");
                    
                    let td1 = document.createElement("td");
                    
                    let td2 = document.createElement("td");
                    
                    let td3 = document.createElement("td");
                    
                    td1.innerHTML = output[markaIndex].formats[i];
                    
                    td2.innerHTML = output[markaIndex].formatsData[i].motorTypes[tipIndex];
                    
                    td3.innerHTML = output[markaIndex].formatsData[i].serialNumber[tipIndex];
                    
                    td1.setAttribute("style", "border:1px solid black;");
                    
                    td2.setAttribute("style", "border:1px solid black;");
                    
                    td3.setAttribute("style", "border:1px solid black;");
                    
                    tr.appendChild(td1);
                    
                    tr.appendChild(td2);
                    
                    tr.appendChild(td3);
                    
                    detailTable.appendChild(tr);
                    
                }
            }
            detailTable.setAttribute("style", "float:left;border:1px solid black;color:darkred;");
        
            document.getElementById("resultTables").appendChild(detailTable);
               
        if(filterState == "nonFiltered"){
            
        document.getElementById("formatCount").innerHTML = "markaya ait " + formats.length + " adet format bulundu!<br/>"
                                                            + output.length + " adet markada toplam " + numberOfFormats + " adet format";
            
        }
        
        if(filterState == "filtered"){
            
            document.getElementById("formatCount").innerHTML = output.length + " adet markada toplam " + numberOfFormats + " filtreden geçirildi.<br /> kalan" + filteredResult.markaDict.length + " markadan " + remainingFormatNumber + " sayıda format kaldı<br />";
            
        }
    },
    
    listSerialNumbers: function(){
        
    },
    
    filterResults : function(){
        
        console.log("filtering...");
        /* filteredMarkas = [ {markaAdi: ....,
        *                      formats : [...{format: ....., counter: 1}...]
        *                       }
        *                  ]
        */
        
        //global filteredResult = {markaDict:[], filteredMarkas: []}; 
        let filteredMarkas = []
        
        let markaDict = [];
        
        for(let markaObj of output){
            
            //marka loop
            
            let label = markaObj.markaAdi;
            
            delete markaObj.formatsData.serialNumber;
            
            delete markaObj.formatsData.motorTypes;
            
            let formatsData = markaObj.formatsData;
                                
            let deletedFormatsData = [];
                                
            markaDict.push(label);
            
            filteredMarkas.push({markaAdi: label, formats:[]});
            
            for(let thisFormat of formatsData){
                
                //format loop
                if(deletedFormatsData.includes(thisFormat)) continue;
                
                let returnCounter = thisFormat.counter;
                let otherFormats = formatsData.filter(dataElem => dataElem != thisFormat);
                
                //leets look at other formats and compere this format with them
                for(otherFormat of otherFormats){
                    
                    let isEqual = (simplifyFormat(thisFormat.format) == simplifyFormat(otherFormat.format));
                    //if two formats are equal
 
                    if(isEqual){
                        
                        returnCounter = otherFormat.counter + thisFormat.counter;
                        
                        if(otherFormat.counter > thisFormat.counter){
                            
                            //add this format to other format: continue wtih this format
                            formatsData[formatsData.indexOf(otherFormat)].counter = returnCounter; 
                            
                            //remove this format
                            deletedFormatsData.push(thisFormat);
                            
                            
                        }
                        
                        if(otherFormat.counter <= thisFormat.counter){
                            
                            //add other format to this format: continue wtih this format
                            formatsData[formatsData.indexOf(thisFormat)].counter = returnCounter;    
                            
                            //remove other format
                            deletedFormatsData.push(otherFormat);
                            
                        }
                        
                    }
                    
                    else {
                        
                        if(returnCounter < 3){ deletedFormatsData.push(thisFormat);}
                        
                    }
                    
                    //next other format
                }
                 
                //next format
            }
            
            
            
            let data = formatsData.filter(format => !deletedFormatsData.includes(format));
            
            //formats : [..{format:..., counter:...}..]
            filteredMarkas[filteredMarkas.length - 1].formats = data;
            
            //next marka
        }
        
        remainingFormatNumber = 0;
        
        for(marka of filteredMarkas){
            
            remainingFormatNumber += marka.formats.length;
            
        }
        
        filteredResult.filteredMarkas = filteredMarkas;
        
        filteredResult.markaDict = markaDict;
        
        filterState = "filtered";
        
        console.log("filterState: " + filterState);
        
        Results.reviseIndexOfSelectedMarka();
        
        showResults();
        
    //En of filterResults()
    }
            

//end of Results
}
                


    window.addEventListener("mouseover", (event) => {
        
        Results.mouseX = event.pageX;
        
        Results.mouseY = event.pageY;
        
    })

function removeFromArray(arr, member){
    
    return arr.filter(elem => elem != member);
    
}

function simplifyFormat(format){
    
    format.trim();
    
    let formatArray = format.split('');
    
    formatArray = formatArray.filter(letter => (letters.includes(letter) || numberLetters.includes(letter)));
    
    return formatArray.join("");
    
}

function exportFilteredResultsAsCSV(){
    
    if(filteredResult != null ){
       
        let data = "marka adi;formatlar;sayisi\n";
        
        let markaList = [...filteredResult.markaDict];
        
        //sort alphabetically
        markaList.sort();
        
        for(markaName of markaList){
            
            let indexOfThisMarka = filteredResult.markaDict.indexOf(markaName);
            
            let markaFormatDatas = filteredResult.filteredMarkas[indexOfThisMarka].formats;
            
            //data += "marka adi;" + markaName + ";\n";
            
            let index = 0;
            
            for(formatData of markaFormatDatas){
                
                data += markaName + ";" + formatData.format + ";" + markaFormatDatas[index].counter + "\n";
                
                index++;
            }
            
        }
        
        downLoadData(data, "sonuclar", ".csv");
       
       } else {
       
       Results.informUser("sonuçlar girilmedi. İmport edin veya yeniden oluşturun");
        
       }
  
    //end of exportResultsAsCSV()
}