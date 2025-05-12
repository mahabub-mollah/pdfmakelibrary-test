var allContent = [];

const pdfReport = function () {
    const buildUrl = function (url) {
        return getValue('projectBaseURL') + url;
    };

    const tableCellWidth = [41, 192, 41.5, 191.5];
    const totalTableWidth = tableCellWidth.reduce(
        (sum, width) => sum + width,
        0
    ); // Sum of all cell widths
    const coverPagePosition = (841.89 - totalTableWidth) / 2; // Center the table horizontally on the landscape page

    const populateModalContent = function (response) {
        common.getGlobalModalBodySelector.html(response);
    };

    const initAfterSuccess = function (module, message) {
        if (module == 'work_view_prescreen') {
            jQuery('#loadProcessStepTableBody').empty();
            jQuery('#process_steps_list_section').hide();
            toastr.error(getValue('noProcessStepFound'));
        }
    };
    formatDateForFilename = function (date) {
        const getDate = date.getFullYear().toString() +
            (date.getMonth() + 1).toString().padStart(2, '0') +
            date.getDate().toString().padStart(2, '0') +
            date.getHours().toString().padStart(2, '0') +
            date.getMinutes().toString().padStart(2, '0') +
            date.getSeconds().toString().padStart(2, '0');
            return getDate;
    }

    return {
        //A method for Post ajax request call
        ajaxPostRequest: function (passUrl, formData, methodType, moduleName) {
            var url = buildUrl(passUrl);
            jQuery.ajax({
                type: methodType,
                url: url,
                data: formData,
                customData: {module: moduleName},
                beforeSend: function (xhr) {
                    loaderStart();
                },
                success: function (response) {
                    loaderStop();
                    if (this.customData.module === 'downloadPDF') {
                        pdfReport.generateReportUsingPdfMake(response, formData['document_name']);
                    }
                    else if (this.customData.module === 'downloadTracePDF') {
                        let docName = formData.find(item => item.name === "document_name")?.value;
                        pdfReport.generateTraceReportFromRecordOutput(response, docName);
                    }
                    else if (this.customData.module === 'downloadImagePDF') {
                        let docName = formData.find(item => item.name === "document_name")?.value;
                        pdfReport.generateImageReportFromRecordOutput(response, docName);
                    }
                    else if (this.customData.module === 'downloadMaterialLabelPDF') {
                        let docName = formData['document_name'];
                        pdfReport.generateReportUsingPdfMake(response, docName);
                    }
                    else if (this.customData.module === 'downloadMaterialPDF') {
                        let docName = formData['document_name'];
                        pdfReport.generateReportUsingPdfMake(response, docName);
                    }
                    else if (this.customData.module === 'downloadMaterialReports') {
                        pdfReport.generateReportUsingPdfMake(response, formData['document_name']);
                    }else if(this.customData.module === 'downloadProductReports'){
                        pdfReport.generateReportUsingPdfMake(response, formData['document_name']);
                    }
                },
                error: function (response) {
                    loaderStop();
                    common.ajaxErrorResponseHandler(response);
                }
            });
        },
        insertSpaces: function(text, n = 10) {
            if (!text || text.trim() === '') {
                return text;
            }

            // Helper function to determine if a character is a double byte character
            function isDoubleByte(char) {
                // A rough check if a character is double-byte (includes common ranges for Japanese characters)
                return encodeURIComponent(char).length > encodeURIComponent('a').length;
            }

            // Check if string is entirely double-byte characters or pure integers
            function isPureDoubleByteOrInteger(str) {
                return [...str].every(ch => isDoubleByte(ch) || /\d/.test(ch));
            }

            // Split by spaces and process each word individually
            if (text.includes(' ')) {
                const words = text.split(' ');
                return words.map(word => {
                    if (!isPureDoubleByteOrInteger(word) && word.length > n) {
                        return word.replace(new RegExp(`(.{${n}})`, 'g'), '$1 ');
                    } else {
                        return word;
                    }
                }).join(' ');
            } else {
                // Process the whole text if no spaces are found
                if (isPureDoubleByteOrInteger(text)) {
                    return text; // Case 1
                } else {
                    return text.replace(new RegExp(`(.{${n}})`, 'g'), '$1 '); // Case 2
                }
            }
        },
        // A method to generate Work Execution report using pdfMake
        prepareWorkExecutionReportContent: function (reports, header) {
            let pdfMakeConfig = getValue('pdfMakeConfig')
            if(reports.length > 0){
                reports.forEach((reportData, index) => {
                    allContent.push(
                        // Section: Facility and Lot
                                {
                                    table: {
                                        widths: tableCellWidth,
                                        body: [
                                            ...reportData.facilityLot.map((item) => [
                                                {text: item['0'], style: '',  fillColor: '#DEEAF6', margin: [0, 1, 0, 1], alignment:'center'},
                                                {text: item['1'], style: '', alignment:"center", fillColor: '', margin: [0, 1, 0, 1]},
                                                {text: item['2'], style: '', fillColor: '#DEEAF6', margin: [0, 1, 0, 1], alignment:'center'},
                                                {text: item['3'], style: '', alignment:"center", fillColor: '', margin: [0, 1, 0, 1]},
                                            ]),
                                        ],
                                    },
                                    layout: {
                                        hLineWidth: function (i, node) {return pdfMakeConfig.combinedReportHeaderTableBorderWidth},
                                        vLineWidth: function (i, node) {return pdfMakeConfig.combinedReportHeaderTableBorderWidth},
                                        hLineColor: function (i, node) { return pdfMakeConfig.combinedReportHeaderTableBorderColor},
                                        vLineColor: function (i, node) { return pdfMakeConfig.combinedReportHeaderTableBorderColor},
                                    },
                                    margin: [127 , 3, 0, 12],
                                    pageHeaderText: header.title
                                },
                                // Section: Product|Process|Version|Room
                                {
                                    table: {
                                        widths: tableCellWidth,
                                        body: [
                                            ...reportData.product.map((item) => [
                                                {text: item['0'], style: '', fillColor: '#DEEAF6', margin: [0, 1, 0, 1], alignment:'center'},
                                                {text: item['1'], style: '', alignment:"center", fillColor: '', margin: [0, 1, 0, 1]},
                                                {text: item['2'], style: '', fillColor: '#DEEAF6', margin: [0, 1, 0, 1], alignment:'center'},
                                                {text: item['3'], style: '', alignment:"center", fillColor: '', margin: [0, 1, 0, 1]},
                                            ]),
                                        ],
                                    },
                                    layout: {
                                        hLineWidth: function (i, node) {return pdfMakeConfig.combinedReportHeaderTableBorderWidth},
                                        vLineWidth: function (i, node) {return pdfMakeConfig.combinedReportHeaderTableBorderWidth},
                                        hLineColor: function (i, node) { return pdfMakeConfig.combinedReportHeaderTableBorderColor},
                                        vLineColor: function (i, node) { return pdfMakeConfig.combinedReportHeaderTableBorderColor},
                                    },
                                    margin: [127 , 0, 12, 10],
                                },
                                // Section: Reservation
                                {
                                    table: {
                                        widths: tableCellWidth,
                                        body: [
                                            ...reportData.reservation.map((item) => [
                                                {text: item['0'], style: '', fillColor: '#DEEAF6', margin: [0, 1, 0, 1], alignment:"center",},
                                                {text: item['1'], style: '', alignment:"center", fillColor: '', margin: [0, 1, 0, 1]},
                                                {text: item['2'], style: '', fillColor: '#DEEAF6', margin: [0, 1, 0, 1], alignment:"center",},
                                                {text: item['3'], style: '', alignment:"center", fillColor: '', margin: [0, 1, 0, 1]},
                                            ]),
                                        ],
                                    },
                                    layout: {
                                        hLineWidth: function (i, node) {return pdfMakeConfig.combinedReportHeaderTableBorderWidth},
                                        vLineWidth: function (i, node) {return pdfMakeConfig.combinedReportHeaderTableBorderWidth},
                                        hLineColor: function (i, node) { return pdfMakeConfig.combinedReportHeaderTableBorderColor},
                                        vLineColor: function (i, node) { return pdfMakeConfig.combinedReportHeaderTableBorderColor},
                                    },
                                    margin: [127 , 0, 20, 5],
                                },
                                // Section: Person In Charge
                                {
                                    text: getValue('lblPersonInCharge'),
                                    style: "",
                                    margin: [127 , 0, 0, 3],
                                },
                                {
                                    table: {
                                        widths: tableCellWidth,
                                        body: [
                                            ...reportData.person.map((item) => [
                                                {text: item['0'], style: '', fillColor: '#DEEAF6', margin: [0, 4, 0, 4], alignment:"center",},
                                                {text: item['1'], style: '',  fillColor: '', margin: [0, 4, 0, 4]},
                                                {text: item['2'], style: '', fillColor: '#DEEAF6', margin: [0, 4, 0, 4], alignment:"center",},
                                                {text: item['3'], style: '',  fillColor: '', margin: [0, 4, 0, 4]},
                                            ]),
                                        ],
                                    },
                                    layout: {
                                        hLineWidth: function (i, node) {return pdfMakeConfig.combinedReportHeaderTableBorderWidth},
                                        vLineWidth: function (i, node) {return pdfMakeConfig.combinedReportHeaderTableBorderWidth},
                                        hLineColor: function (i, node) { return pdfMakeConfig.combinedReportHeaderTableBorderColor},
                                        vLineColor: function (i, node) { return pdfMakeConfig.combinedReportHeaderTableBorderColor},
                                    },
                                    margin: [127 , 0, 0, 5],
                                },
                                // Section: Workers
                                {
                                    text: getValue('lblExecutor'),
                                    style: "",
                                    margin: [127, 0, 0, 3],
                                },
                                {
                                    table: {
                                        widths: [143, 190, 140],
                                        body: [
                                            ...reportData.workers.map((item) => [
                                                {text: item['0'], style: '', fillColor: '#DEEAF6', margin: [0, 1, 0, 1], alignment: 'center'},
                                                {text: item['1'], style: '', fillColor: '', margin: [0, 1, 0, 1], alignment: 'center'},
                                                {text: item['2'], style: '', fillColor: '', margin: [0, 1, 0, 1], alignment: 'center'},
                                            ]),
                                        ],
                                    },
                                    layout: {
                                        hLineWidth: function (i, node) {return pdfMakeConfig.combinedReportHeaderTableBorderWidth},
                                        vLineWidth: function (i, node) {return pdfMakeConfig.combinedReportHeaderTableBorderWidth},
                                        hLineColor: function (i, node) { return pdfMakeConfig.combinedReportHeaderTableBorderColor},
                                        vLineColor: function (i, node) { return pdfMakeConfig.combinedReportHeaderTableBorderColor},
                                    },
                                    margin: [127, 0, 0, 7], // Center the table vertically
                                },
                                // Section: Note
                                {
                                    stack: [
                                        {text: getValue('lblNote'), style: '', margin: [0, 0, 0, 0]},
                                        {
                                            canvas: [
                                                {type: 'line', x1: 0, y1: 0, x2: 500, y2: 0, lineWidth: 0.5, lineColor: "#ddd"} // Horizontal line
                                            ]
                                        },
                                    ],
                                    margin: [127, 13, 0, 0],
                                },
                        // Adding a page break
                        {text: "", pageBreak: "before"},
                        {
                            table: {
                                headerRows: 1,
                                widths: [17, 70, 168, 108, 69, 58, 61, 62, 107], // 9 columns
                                body: [
                                    [
                                        {
                                            text: getValue('reportLblNo'),
                                            style: 'tableHeader',
                                            fillColor: '#A9D08E',
                                            alignment: 'center',
                                            margin: [-2, 5, 0, 0],
                                        }, // No.
                                        {
                                            text: getValue('lblItem'),
                                            style: 'tableHeader',
                                            fillColor: '#A9D08E',
                                            alignment: 'center',
                                            margin: [0, 5, 0, 0],
                                        }, // Item
                                        {
                                            text: getValue('lblWorkProcedure'),
                                            style: 'tableHeader',
                                            fillColor: '#A9D08E',
                                            alignment: 'center',
                                            margin: [0, 5, 0, 0],
                                        }, // Work Procedure
                                        {
                                            text: getValue('lblItemUsed'),
                                            style: 'tableHeader',
                                            fillColor: '#A9D08E',
                                            alignment: 'center',
                                            margin: [0, 5, 0, 0],
                                        }, // Item Used
                                        {
                                            text: getValue('lblTaskRemarks'),
                                            style: 'tableHeader',
                                            fillColor: '#A9D08E',
                                            alignment: 'center',
                                            margin: [0, 5, 0, 0],
                                        }, // Remarks
                                        {
                                            table: {
                                                widths: ['100%'],
                                                body: [
                                                    [{
                                                        text: getValue('lblProcessConditions'),
                                                        style: 'tableHeader',
                                                        fillColor: '#5B9BD5',
                                                        color: 'white',
                                                        alignment: 'center'
                                                    }], // Process Condition
                                                    [{
                                                        text: getValue('lblInstructions'),
                                                        style: 'tableHeader',
                                                        fillColor: '#FFC300',
                                                        alignment: 'center'
                                                    }] // Instruction
                                                ]
                                            },
                                            layout: {
                                                hLineWidth: function (i, node) {
                                                    return (i === 1) ? pdfMakeConfig.combinedReportBodyTableBorderWidth : 0; // Only show horizontal line between the rows
                                                },
                                                vLineWidth: function (i, node) {
                                                    return 0; // No vertical lines
                                                },
                                                hLineColor: function (i, node) {
                                                    return pdfMakeConfig.combinedReportBodyTableBorderColor; // Black color for the horizontal line
                                                },
                                                paddingLeft: function(i, node) { return 0; }, // Set padding to 0
                                                paddingRight: function(i, node) { return 0; }, // Set padding to 0
                                                paddingTop: function(i, node) { return 0; }, // Set padding to 0
                                                paddingBottom: function(i, node) { return 0; } // Set padding to 0
                                            },
                                        },
                                        {
                                            table: {
                                                widths: ['100%'],
                                                body: [
                                                    [{
                                                        text: getValue('lblWorkRecord'),
                                                        style: 'tableHeader',
                                                        fillColor: '#5B9BD5',
                                                        color: 'white',
                                                        alignment: 'center'
                                                    }], // Work Record
                                                    [{
                                                        text: getValue('lblWorkResults'),
                                                        style: 'tableHeader',
                                                        fillColor: '#FFC300',
                                                        alignment: 'center'
                                                    }] // Work Results
                                                ]
                                            },
                                            margin: [0, 0, 0, 0],
                                            layout: {
                                                hLineWidth: function (i, node) {
                                                    return (i === 1) ? pdfMakeConfig.combinedReportBodyTableBorderWidth : 0; // Only show horizontal line between the rows
                                                },
                                                vLineWidth: function (i, node) {
                                                    return 0; // No vertical lines
                                                },
                                                hLineColor: function (i, node) {
                                                    return pdfMakeConfig.combinedReportBodyTableBorderColor; // Black color for the horizontal line
                                                },
                                                paddingLeft: function(i, node) { return 0; }, // Set padding to 0
                                                paddingRight: function(i, node) { return 0; }, // Set padding to 0
                                                paddingTop: function(i, node) { return 0; }, // Set padding to 0
                                                paddingBottom: function(i, node) { return 0; } // Set padding to 0
                                            },
                                        },
                                        {
                                            table: {
                                                widths: ['100%'],
                                                body: [
                                                    [{
                                                        text: getValue('lblEndDateTime'),
                                                        style: 'tableHeader',
                                                        fillColor: '#0091ff',
                                                        color: 'white',
                                                        alignment: 'center'
                                                    }], // End Date and Time
                                                    [{
                                                        text: getValue('lblResult'),
                                                        style: 'tableHeader',
                                                        fillColor: '#0091ff',
                                                        color: 'white',
                                                        alignment: 'center'
                                                    }] // Result
                                                ]
                                            },
                                            margin: [0, 0, 0, 0],
                                            layout: {
                                                hLineWidth: function (i, node) {
                                                    return (i === 1) ? pdfMakeConfig.combinedReportBodyTableBorderWidth : 0; // Only show horizontal line between the rows
                                                },
                                                vLineWidth: function (i, node) {
                                                    return 0; // No vertical lines
                                                },
                                                hLineColor: function (i, node) {
                                                    return pdfMakeConfig.combinedReportBodyTableBorderColor; // Black color for the horizontal line
                                                },
                                                paddingLeft: function(i, node) { return 0; }, // Set padding to 0
                                                paddingRight: function(i, node) { return 0; }, // Set padding to 0
                                                paddingTop: function(i, node) { return 0; }, // Set padding to 0
                                                paddingBottom: function(i, node) { return 0; } // Set padding to 0
                                            },
                                        },
                                        {
                                            text: getValue('lblRemarks'),
                                            style: 'tableHeader',
                                            fillColor: '#0091ff',
                                            color: 'white',
                                            alignment: 'center',
                                            margin: [0, 5, 0, 0]
                                        }  // Remarks
                                    ],
                                    ...reportData.dataContent.map(item => [
                                        {text: item['No.'], style: '', fillColor: item['grayedOut'],},
                                        {text: pdfReport.insertSpaces(item['Item'], 14), style: '', fillColor: item['grayedOut']},
                                        {text: pdfReport.insertSpaces(item['Work Procedure'], 32), style: '', fillColor: item['grayedOut']},
                                        {text: pdfReport.insertSpaces(item['Item Used'], 19), style: '', fillColor: item['grayedOut']},
                                        {text: pdfReport.insertSpaces(item['Remarks'], 16), style: '', fillColor: item['grayedOut']},
                                        {
                                            table: {
                                                widths: [59.5, 59.5],
                                                body: item['combined'] ? item['combined'].flatMap((itm, index, array) => [
                                                    [
                                                        {text: pdfReport.insertSpaces(itm['a'], 20), margin: [2, 0, 3, 2]},
                                                        {text: itm['b'], margin: [2, 0, 0, 4],}
                                                    ],
                                                    ...(index < array.length - 1 ? [[
                                                        {
                                                            colSpan: 2,
                                                            margin: [0, .5, 0, 0],
                                                            canvas: [
                                                                {type: "line", x1: 0, y1: 0, x2: 120, y2: 0, 
                                                                    lineWidth: pdfMakeConfig.combinedReportBodyTableBorderWidth, 
                                                                    lineColor: pdfMakeConfig.combinedReportBodyTableBorderColor
                                                                }
                                                            ]
                                                        },
                                                        {} // Empty cell for colSpan
                                                    ]] : [])
                                                ]) : [] // Ensure rawGeneralMaterials exists and map over it
                                            },
                                            layout: {
                                                hLineWidth: function (i, node) {
                                                    return 0;
                                                }, // Main table horizontal line width
                                                vLineWidth: function (i, node) {
                                                    return 0;
                                                }, // Main table vertical line width
                                                paddingLeft: function (i, node) {
                                                    return 0;
                                                },
                                                paddingRight: function (i, node) {
                                                    return 0;
                                                },
                                                paddingTop: function (i, node) {
                                                    return 0;
                                                },
                                                paddingBottom: function (i, node) {
                                                    return 0;
                                                }
                                            },
                                            fillColor: item['grayedOut'],
                                            //layout: "lightHorizontalLines",
                                        },
                                        {text: '', fillColor: item['grayedOut']},
                                        {
                                            table: {
                                                widths: [52], // 2 equal columns
                                                body: [
                                                    [{text: item['End Date and Time'], style: 'tableRow'}],
                                                    [{text: item['Result'], style: 'tableRow', color:'blue'}]
                                                ]
                                            },
                                            layout: {
                                                hLineWidth: function (i, node) {
                                                    return (i === 1) ? pdfMakeConfig.combinedReportBodyTableBorderWidth : 0; // Only show horizontal line between the rows
                                                },
                                                vLineWidth: function (i, node) {
                                                    return 0; // No vertical lines
                                                },
                                                hLineColor: function (i, node) {
                                                    return pdfMakeConfig.combinedReportBodyTableBorderColor; // Black color for the horizontal line
                                                },
                                                paddingLeft: function (i, node) {
                                                    return 5;
                                                },
                                                paddingRight: function (i, node) {
                                                    return 5;
                                                },
                                                paddingTop: function (i, node) {
                                                    return 0;
                                                },
                                                paddingBottom: function (i, node) {
                                                    return 0;
                                                }
                                            },
                                            fillColor: item['grayedOut']
                                        },
                                        {text: pdfReport.insertSpaces(item['Others'], 25), style: '', fillColor: item['grayedOut']}
                                    ])
                                ],
                            },
                            layout: {
                                hLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                                vLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                                hLineColor: function (i, node) {
                                    return pdfMakeConfig.combinedReportBodyTableBorderColor;
                                },
                                vLineColor: function (i, node) {
                                    return pdfMakeConfig.combinedReportBodyTableBorderColor;
                                },
                                paddingLeft: function (i, node) {
                                    return i === 5 || i === 6 || i === 7 ? 0 : 5;
                                    // return 0;
                                },
                                paddingRight: function (i, node) {
                                    return 0;
                                },
                                paddingTop: function (i, node) {
                                    return 0;
                                },
                                paddingBottom: function (i, node) {
                                    return 0;
                                }
                            },
                            margin: [0, 0, 0, 0],
                        }
                    );
                    if (index < reports.length - 1) {
                        allContent.push({text: "", pageBreak: "before"});
                    }
                });
            }else{
                allContent.push(
                    {
                        table: {
                            headerRows: 1,
                            widths: [17, 70, 168, 108, 69, 58, 61, 62, 107], // 9 columns
                            body: [
                                [
                                    {
                                        text: getValue('reportLblNo'),
                                        style: 'tableHeader',
                                        fillColor: '#A9D08E',
                                        alignment: 'center',
                                        margin: [-2, 5, 0, 0],
                                    }, // No.
                                    {
                                        text: getValue('lblItem'),
                                        style: 'tableHeader',
                                        fillColor: '#A9D08E',
                                        alignment: 'center',
                                        margin: [0, 5, 0, 0],
                                    }, // Item
                                    {
                                        text: getValue('lblWorkProcedure'),
                                        style: 'tableHeader',
                                        fillColor: '#A9D08E',
                                        alignment: 'center',
                                        margin: [0, 5, 0, 0],
                                    }, // Work Procedure
                                    {
                                        text: getValue('lblItemUsed'),
                                        style: 'tableHeader',
                                        fillColor: '#A9D08E',
                                        alignment: 'center',
                                        margin: [0, 5, 0, 0],
                                    }, // Item Used
                                    {
                                        text: getValue('lblTaskRemarks'),
                                        style: 'tableHeader',
                                        fillColor: '#A9D08E',
                                        alignment: 'center',
                                        margin: [0, 5, 0, 0],
                                    }, // Remarks
                                    {
                                        table: {
                                            widths: ['100%'],
                                            body: [
                                                [{
                                                    text: getValue('lblProcessConditions'),
                                                    style: 'tableHeader',
                                                    fillColor: '#5B9BD5',
                                                    color: 'white',
                                                    alignment: 'center'
                                                }], // Process Condition
                                                [{
                                                    text: getValue('lblInstructions'),
                                                    style: 'tableHeader',
                                                    fillColor: '#FFC300',
                                                    alignment: 'center'
                                                }] // Instruction
                                            ]
                                        },
                                        layout: {
                                            hLineWidth: function (i, node) {
                                                return (i === 1) ? pdfMakeConfig.combinedReportBodyTableBorderWidth : 0; // Only show horizontal line between the rows
                                            },
                                            vLineWidth: function (i, node) {
                                                return 0; // No vertical lines
                                            },
                                            hLineColor: function (i, node) {
                                                return pdfMakeConfig.combinedReportBodyTableBorderColor; // Black color for the horizontal line
                                            },
                                            paddingLeft: function(i, node) { return 0; }, // Set padding to 0
                                            paddingRight: function(i, node) { return 0; }, // Set padding to 0
                                            paddingTop: function(i, node) { return 0; }, // Set padding to 0
                                            paddingBottom: function(i, node) { return 0; } // Set padding to 0
                                        },
                                    },
                                    {
                                        table: {
                                            widths: ['100%'],
                                            body: [
                                                [{
                                                    text: getValue('lblWorkRecord'),
                                                    style: 'tableHeader',
                                                    fillColor: '#5B9BD5',
                                                    color: 'white',
                                                    alignment: 'center'
                                                }], // Work Record
                                                [{
                                                    text: getValue('lblWorkResults'),
                                                    style: 'tableHeader',
                                                    fillColor: '#FFC300',
                                                    alignment: 'center'
                                                }] // Work Results
                                            ]
                                        },
                                        margin: [0, 0, 0, 0],
                                        layout: {
                                            hLineWidth: function (i, node) {
                                                return (i === 1) ? pdfMakeConfig.combinedReportBodyTableBorderWidth : 0; // Only show horizontal line between the rows
                                            },
                                            vLineWidth: function (i, node) {
                                                return 0; // No vertical lines
                                            },
                                            hLineColor: function (i, node) {
                                                return pdfMakeConfig.combinedReportBodyTableBorderColor; // Black color for the horizontal line
                                            },
                                            paddingLeft: function(i, node) { return 0; }, // Set padding to 0
                                            paddingRight: function(i, node) { return 0; }, // Set padding to 0
                                            paddingTop: function(i, node) { return 0; }, // Set padding to 0
                                            paddingBottom: function(i, node) { return 0; } // Set padding to 0
                                        },
                                    },
                                    {
                                        table: {
                                            widths: ['100%'],
                                            body: [
                                                [{
                                                    text: getValue('lblEndDateTime'),
                                                    style: 'tableHeader',
                                                    fillColor: '#0091ff',
                                                    color: 'white',
                                                    alignment: 'center'
                                                }], // End Date and Time
                                                [{
                                                    text: getValue('lblResult'),
                                                    style: 'tableHeader',
                                                    fillColor: '#0091ff',
                                                    color: 'white',
                                                    alignment: 'center'
                                                }] // Result
                                            ]
                                        },
                                        margin: [0, 0, 0, 0],
                                        layout: {
                                            hLineWidth: function (i, node) {
                                                return (i === 1) ? pdfMakeConfig.combinedReportBodyTableBorderWidth : 0; // Only show horizontal line between the rows
                                            },
                                            vLineWidth: function (i, node) {
                                                return 0; // No vertical lines
                                            },
                                            hLineColor: function (i, node) {
                                                return pdfMakeConfig.combinedReportBodyTableBorderColor; // Black color for the horizontal line
                                            },
                                            paddingLeft: function(i, node) { return 0; }, // Set padding to 0
                                            paddingRight: function(i, node) { return 0; }, // Set padding to 0
                                            paddingTop: function(i, node) { return 0; }, // Set padding to 0
                                            paddingBottom: function(i, node) { return 0; } // Set padding to 0
                                        },
                                    },
                                    {
                                        text: getValue('lblRemarks'),
                                        style: 'tableHeader',
                                        fillColor: '#0091ff',
                                        color: 'white',
                                        alignment: 'center',
                                        margin: [0, 5, 0, 0]
                                    }  // Remarks
                                ],
                            ],
                        },
                        layout: {
                            hLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                            vLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                            hLineColor: function (i, node) {
                                return pdfMakeConfig.combinedReportBodyTableBorderColor;
                            },
                            vLineColor: function (i, node) {
                                return pdfMakeConfig.combinedReportBodyTableBorderColor;
                            },
                            paddingLeft: function (i, node) {
                                return i === 5 || i === 6 || i === 7 ? 0 : 5;
                            },
                            paddingRight: function (i, node) {
                                return 0;
                            },
                            paddingTop: function (i, node) {
                                return 0;
                            },
                            paddingBottom: function (i, node) {
                                return 0;
                            }
                        },
                        margin: [0, 0, 0, 0],
                        pageHeaderText: header.title,
                    }
                );
            }
        },

        // A method to generate Material report using pdfMake
        prepareMaterialsReportContent: function (reportData, header) {
            let pdfMakeConfig = getValue('pdfMakeConfig');
            if (allContent.length > 0) {
                allContent.push({text: "", pageBreak: "before"});
            }

            allContent.push({
                table: {
                    headerRows: 1,
                    widths: [22, 50, 27, 89, 37, 74.5, 35, 37, 20, 25, 52, 62, 110], // 13 columns
                    body: [
                        [
                            {text: getValue('lblMaterialType'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 5, 0, 0]},
                            {text: getValue('lblMaterialProjectCode'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 0, 0, 0]},
                            {text: getValue('lblMaterialVersion'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 5, 0, 0]},
                            {text: getValue('lblMaterialLotNumber'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 5, 0, 0]},
                            {text: getValue('lblMaterialProductNumber'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 5, 0, 0]},
                            {text: getValue('lblMaterialMaterialName'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 5, 0, 0]},
                            {text: getValue('lblMaterialUniqueNumber'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 5, 0, 0]},
                            {text: getValue('lblMaterialSerialNumber'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 5, 0, 0]},
                            {text: getValue('lblMaterialBranchNumber'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 5, 0, 0]},
                            {text: getValue('lblMaterialUseStatus'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 0, 0, 0]},
                            {text: getValue('lblMaterialWorkStartDate'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 5, 0, 0]},
                            {text: getValue('lblMaterialArrivalDate'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 5, 0, 0]},
                            {text: getValue('lblMaterialValidityExpiryDate'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 5, 0, 0]},
                        ],
                        ...reportData,
                    ],
                },
                layout: {
                    hLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                    vLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                    hLineColor: function (i, node) {
                        return pdfMakeConfig.combinedReportBodyTableBorderColor;
                    },
                    vLineColor: function (i, node) {
                        return pdfMakeConfig.combinedReportBodyTableBorderColor;
                    },
                    fillEmptyBlocks: false,
                },
                margin: [0, 0, 0, 0],
                pageHeaderText: header.title,
            });
        },

        // A method to Raw/Generate Material report using pdfMake
        prepareRawGeneralMaterialsReportContent: function (reportData, header) {
            let pdfMakeConfig = getValue('pdfMakeConfig');
            if (allContent.length > 0) {
                allContent.push({text: "", pageBreak: "before"});
            }

            allContent.push({
                table: {
                    headerRows: 1,
                    widths: [26, 122, 28, 90, 43, 98, 26, 40, 35, 29, 34, 79.8], // 13 columns
                    body: [
                        [
                            {text: getValue('lblMaterialType'), style: "tableHeader", margin:[0, 5,0,0], fillColor: "#A9D08E", alignment: "center"},
                            {
                                text: getValue('lblMaterialProjectCode'),
                                style: "tableHeader",
                                fillColor: "#A9D08E",
                                alignment: "center",
                                margin:[0, 5,0,0],
                            },
                            {text: getValue('lblMaterialVersion'), style: "tableHeader", margin:[0, 5,0,0], fillColor: "#A9D08E", alignment: "center"},
                            {text: getValue('lblMaterialLotNumber'), style: "tableHeader", margin:[0, 5,0,0], fillColor: "#A9D08E", alignment: "center"},
                            {text: getValue('lblMaterialMaterialName'), style: "tableHeader", margin:[0, 5,0,0], fillColor: "#A9D08E", alignment: "center"},
                            {text: getValue("lblMaterialSerialNumber"), style: "tableHeader", margin:[0, 5,0,0], fillColor: "#A9D08E", alignment: "center"},
                            {text: getValue("lblMaterialUseStatus"), style: "tableHeader", margin:[0, 5,0,0], fillColor: "#A9D08E", alignment: "center"},
                            {text: getValue("lblMaterialWorkStartDate"), style: "tableHeader", fillColor: "#A9D08E", alignment: "center"},
                            {text: getValue("lblSerialLabel"), style: "tableHeader", margin:[0, 5,0,0], fillColor: "#A9D08E", alignment: "center"},
                            {text: getValue("lblSupplierName"), style: "tableHeader", fillColor: "#A9D08E", alignment: "center"},
                            {text: getValue("lblMaterialArrivalDate"), style: "tableHeader", fillColor: "#A9D08E", alignment: "center"},
                            {text: getValue("lblMaterialValidityExpiryDate"), style: "tableHeader", margin:[0, 5,0,0], fillColor: "#A9D08E", alignment: "center"},
                        ],
                        ...reportData,
                    ],
                },
                layout: {
                    hLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                    vLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                    hLineColor: function (i, node) {
                        return pdfMakeConfig.combinedReportBodyTableBorderColor;
                    },
                    vLineColor: function (i, node) {
                        return pdfMakeConfig.combinedReportBodyTableBorderColor;
                    },
                    fillEmptyBlocks: false,
                },
                headerStyles: {
                    bold: true,
                },
                margin: [0, 0, 0, 0],
                pageHeaderText: header.title,
            });
        },

        // A method to generate Material Label report using pdfMake
        prepareMaterialLabelReportContent: function (reportData, header) {
            let pdfMakeConfig = getValue('pdfMakeConfig');
            if (allContent.length > 0) {
                allContent.push({text: "", pageBreak: "before"});
            }
            allContent.push({
                table: {
                    headerRows: 1,
                    widths: [11, 34, 11, 92, 30, 45, 22, 24, 18, 27, 28, 48, 10, 58, 110, 10, 10, 9], // 18 columns
                    body: [
                        [
                            {text: getValue('lblMaterialLabelType'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0,20,0,0]},
                            {
                                text: getValue('lblMaterialLabelProjectCode'),
                                style: "tableHeader",
                                fillColor: "#A9D08E",
                                alignment: "center",
                                margin:[0,20,0,0]
                            },
                            {text: getValue('lblMaterialLabelVersion'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0,20,0,0]},
                            {text: getValue('lblMaterialLabelLotNumber'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0,25,0,0]},
                            {text: getValue('lblMaterialLabelProductNumber'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0,25,0,0]},
                            {text: getValue('lblMaterialLabelMaterialName'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0,25,0,0]},
                            {text: getValue('lblMaterialLabelUniqueNumber'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0,25,0,0]},
                            {text: getValue('lblMaterialLabelSerialNumber'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0,20,0,0]},
                            {text: getValue('lblMaterialLabelBranchNumber'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0,25,0,0]},
                            {text: getValue('lblMaterialLabelProcessName'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0,25,0,0]},
                            {text: getValue('lblMaterialLabelStepName'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0,20,0,0]},
                            {text: getValue('lblMaterialLabelTaskName'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0,25,0,0]},
                            {text: getValue('lblMaterialLabelWorkStartDate'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0,5,0,0]},
                            {text: getValue('lblMaterialLabelArivalDate'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0,25,0,0]},
                            {text: getValue('lblMaterialLabelValidityExpairyDate'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0,25,0,0]},
                            {text: getValue('lblMaterialLabelNoOfPrint'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0,0,0,0]},
                            {text: getValue('lblMaterialLabelNoOfUsed'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0,10,0,0]},
                            {text: getValue('lblMaterialLabelNoOfDiscard'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0,10,0,0]},
                        ],
                        ...reportData,
                    ],
                },
                layout: {
                    hLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                    vLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                    hLineColor: function (i, node) {
                        return pdfMakeConfig.combinedReportBodyTableBorderColor;
                    },
                    vLineColor: function (i, node) {
                        return pdfMakeConfig.combinedReportBodyTableBorderColor;
                    },
                    fillEmptyBlocks: false,
                },
                headerStyles: {
                    bold: true,
                },
                margin: [0, 0, 0, 0],
                pageHeaderText: header.title,
            });
        },

        // A method to generate Raw/General Material Label report using pdfMake
        prepareRawGeneralMaterialLabelReportContent: function (reportData, header) {
            let pdfMakeConfig = getValue('pdfMakeConfig');
            if (allContent.length > 0) {
                allContent.push({text: "", pageBreak: "before"});
            }
            allContent.push({
                table: {
                    headerRows: 1,
                    widths: [26, 86, 28, 90, 42, 98, 26, 21, 20, 21, 35, 45.2, 30, 28, 28], // 15 columns
                    body: [
                        [
                            {text: getValue('lblMaterialType'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 12,0,0]},
                            {text: getValue('lblMaterialProjectCode'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 12,0,0]},
                            {
                                text: getValue('lblMaterialVersion'),
                                style: "tableHeader",
                                fillColor: "#A9D08E",
                                alignment: "center",
                                margin:[0, 12,0,0]
                            },
                            {text: getValue('lblMaterialLotNumber'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 12,0,0]},
                            {text: getValue('lblMaterialMaterialName'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 12,0,0]},
                            {text: getValue("lblMaterialSerialNumber"), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 12,0,0]},
                            {text: getValue("lblMaterialUseStatus"), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 12,0,0]},
                            {text: getValue("lblMaterialWorkStartDate"), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 7,0,0]},
                            {text: getValue("lblSerialLabel"), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 7,0,0]},
                            {text: getValue("lblSupplierName"), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 7,0,0]},
                            {text: getValue("lblMaterialArrivalDate"), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 7,0,0]},
                            {text: getValue("lblMaterialValidityExpiryDate"), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 7,0,0]},
                            {text: getValue("lblNoOfPrint"), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 7,0,0]},
                            {text: getValue("lblNoOfUsed"), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 12,0,0]},
                            {text: getValue("lblNoOfDiscard"), style: "tableHeader", fillColor: "#A9D08E", alignment: "center", margin:[0, 12,0,0]},
                        ],
                        ...reportData,
                    ],
                },
                layout: {
                    hLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                    vLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                    hLineColor: function (i, node) {
                        return pdfMakeConfig.combinedReportBodyTableBorderColor;
                    },
                    vLineColor: function (i, node) {
                        return pdfMakeConfig.combinedReportBodyTableBorderColor;
                    },
                    fillEmptyBlocks: false,
                },
                headerStyles: {
                    bold: true,
                },
                margin: [0, 0, 0, 0],
                pageHeaderText: header.title,
            });
        },

        // A method to generate Trace report using pdfMake
        prepareTraceReportContent: function (reportData) {
            let pdfMakeConfig = getValue('pdfMakeConfig');
            if (allContent.length > 0) {
                allContent.push({text: "", pageBreak: "before"});
            }

            if(reportData.length > 0){
                reportData.forEach((traceData, i) => {
                    let traceDataContent = traceData?.content?.length ? traceData.content.map((trace) => [
                        // Material Name Section
                        {
                            table: {
                                widths: [113, 85],
                                body: trace['materials']?.length ? trace['materials'].flatMap((material, index, array) => [
                                    [
                                        {text: material['name'], margin: [2, 0, 0, 0]},
                                        {text: material['sn'].join('\n'), margin: [2, 0, 0, 0], alignment: "left"}
                                    ],
                                    ...(index < array.length - 1 ? [[
                                        {
                                            colSpan: 2,
                                            margin: [0, 0, 0, 0],
                                            canvas: [
                                                {type: "line", x1: 0, y1: 0, x2: 207, y2: 0, lineWidth: pdfMakeConfig.combinedReportBodyTableBorderWidth, lineColor: pdfMakeConfig.combinedReportBodyTableBorderColor}
                                            ]
                                        },
                                        {} // Empty cell for colSpan
                                    ]] : [])
                                ]) : [[]] // Ensure rawGeneralMaterials exists and map over it
                            },
                            layout: "noBorders",
                            //layout: "lightHorizontalLines",
                        },
                        {},
                        // Plus Section
                        {"text": " + ", "style": "tableHeader", "alignment": "center", margin: [-4, 0, 0, 0]},
                        // Raw/General Materials Section
                        {
                            table: {
                                widths: [186, 85],
                                body: trace['rawGeneralMaterials']?.length ? trace['rawGeneralMaterials'].flatMap((material, index, array) => [
                                    [
                                        {text: material['name'], margin: [2, 0, 0, 0], alignment: "left"},
                                        {text: material['sn'].join('\n'), margin: [2, 0, , 0], alignment: "left"}
                                    ],
                                    ...(index < array.length - 1 ? [[
                                        {
                                            colSpan: 2,
                                            margin: [0, 0, 0, 0],
                                            canvas: [
                                                {type: "line", x1: 0, y1: 0, x2: 281, y2: 0, lineWidth: pdfMakeConfig.combinedReportBodyTableBorderWidth, lineColor: pdfMakeConfig.combinedReportBodyTableBorderColor}
                                            ]
                                        },
                                        {} // Empty cell for colSpan
                                    ]] : [])
                                ]) : [[]] // Ensure rawGeneralMaterials exists and map over it
                            },
                            layout: "noBorders",
                            //layout: "lightHorizontalLines",
                        },
                        {},
                        // Equal Section
                        {text: " = ", style: "tableHeader", alignment: "center", margin: [-4, 0, 0, 0]},
                        // Final Product Section
                        {text: trace['finalProduct']['name'], alignment:"left", margin: [-2, 0, 0, 0],},
                        {text: trace['finalProduct']['sn'].join('\n'), alignment:"left", margin: [-2, 0, 0, 0],}
                    ]) : [];
                    
                    allContent.push(
                        // header
                        {
                            table: {
                                headerRows: 1,
                                widths: [241, 243, 240],  // Explicitly set widths
                                body: [
                                    [
                                        {
                                            "text": [
                                                { "text": `${getValue('lblTraceProjectCode')}`, "style": "underlinedText" },
                                                { "text": ` : `, "style": "traceSeparator"},
                                                { "text": traceData.common.projectCode, "style": "underlinedText" }
                                            ],
                                            "border": [true, true, false, false]
                                        },
                                        {
                                            "text": [
                                                { "text": `${getValue('lblTraceProjectName')}`, "style": "underlinedText"},
                                                { "text": ` : `, "style": "traceSeparator"},
                                                { "text": traceData.common.projectName, "style": "underlinedText" }
                                            ],
                                            "border": [false, true, false, false]
                                        },
                                        {
                                            "text": [
                                                { "text": `${getValue('lblTraceIdentifyingNumber')}`, "style": "underlinedText" },
                                                { "text": ` : `, "style": "traceSeparator"},
                                                { "text": traceData.common.lotCode, "style": "underlinedText" }
                                            ],
                                            "border": [false, true, true, false]
                                        },
                                    ],
                                    [
                                        {
                                            "text": [
                                                { "text": `${getValue('lblTraceProcessName')}`, "style": "underlinedText"},
                                                { "text": ` : `, "style": "traceSeparator"},
                                                { "text": traceData.common.processName, "style": "underlinedText" }
                                            ],
                                            "border": [true, false, false, false]
                                        },
                                        {
                                            "text": [
                                                { "text": `${getValue('lblTraceStepName')}`, "style": "underlinedText" },
                                                { "text": ` : `, "style": "traceSeparator"},
                                                { "text": traceData.common.stepName, "style": "underlinedText"  }
                                            ],
                                            "border": [false, false, false, false]
                                        },
                                        {"text": "", "style": "tableText", "border": [false, false, true, false]},
                                    ],
                                    [
                                        {
                                            "text": [
                                                { "text": `${getValue('lblTraceWorkingDay')}`, "style": "underlinedText"},
                                                { "text": ` : `, "style": "traceSeparator"},
                                                { "text": traceData.common.workingDay, "style": "underlinedText" }
                                            ],
                                            "colSpan": 3,
                                            "border": [true, false, true, true]
                                        },
                                        {}, {},
                                    ],
                                ]
                            },
                            margin: [0, 0, 0, 0],
                            layout: {
                                hLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                                vLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                                hLineColor: function (i, node) {
                                    return pdfMakeConfig.combinedReportBodyTableBorderColor;
                                },
                                vLineColor: function (i, node) {
                                    return pdfMakeConfig.combinedReportBodyTableBorderColor;
                                },
                                paddingLeft: function (i, node) {
                                    return 5;
                                },
                                paddingRight: function (i, node) {
                                    return 5;
                                },
                                paddingTop: function (i, node) {
                                    return 5;
                                },
                                paddingBottom: function (i, node) {
                                    return 5;
                                }
                            },
                            pageHeaderText: traceData.header.title // Custom Key: Use for the header text
                        },
                        // Data Table
                        {
                            table: {
                                headerRows: 2,
                                widths: [120, 86, 9, 193, 87, 9, 146, 80],  // Explicitly set widths
                                body: [
                                    [
                                        {
                                            "text": getValue('lblTraceMaterialHeader'),
                                            "style": "tableHeader",
                                            "colSpan": 5,
                                            "fillColor": "#A6A6A6",
                                            margin: [5, 2, 0, 2],
                                            "alignment": "center"
                                        },
                                        {}, {}, {}, {},
                                        {
                                            "text": getValue('lblTracePreparation'),
                                            "style": "tableHeader",
                                            "colSpan": 3,
                                            "fillColor": "#A6A6A6",
                                            margin: [5, 2, 0, 2],
                                            "alignment": "center"
                                        },
                                        {}, {}
                                    ],
                                    [
                                        {
                                            "text": getValue('lblTraceMaterial'),
                                            "style": "tableHeader",
                                            "fillColor": "#D6DCE5",
                                            margin: [5, 2, 0, 2],
                                            "alignment": "center"
                                        },
                                        {
                                            "text": getValue('lblTraceSN'),
                                            "style": "tableHeader",
                                            "fillColor": "#D6DCE5",
                                            margin: [5, 2, 0, 2],
                                            "alignment": "center"
                                        },
                                        {
                                            "text": " + ",
                                            "style": "tableHeader",
                                            "alignment": "center",
                                            "fillColor": "#9DC3E6",
                                            margin: [-4, 0, 0, 0],
                                        },
                                        {
                                            "text": getValue('lblTraceRawMaterialsMaterials'),
                                            "style": "tableHeader",
                                            "fillColor": "#DEEBF7",
                                            margin: [5, 2, 0, 2],
                                            "alignment": "center"
                                        },
                                        {
                                            "text": getValue('lblTraceSN'),
                                            "style": "tableHeader",
                                            "fillColor": "#DEEBF7",
                                            margin: [5, 2, 0, 2],
                                            "alignment": "center"
                                        },
                                        {
                                            "text": " = ",
                                            "style": "tableHeader",
                                            "alignment": "center",
                                            "fillColor": "#9DC3E6",
                                            margin: [-4, 0, 0, 0],
                                        },
                                        {
                                            "text": getValue('lblTraceFinishedProduct'),
                                            "style": "tableHeader",
                                            "fillColor": "#DAE3F3",
                                            "alignment": "center",
                                            margin: [0, 2, 0, 0],
                                        },
                                        {"text": getValue('lblTraceSN'), "style": "tableHeader", "fillColor": "#DAE3F3", margin: [0, 2, 0, 0], "alignment": "center"}
                                    ],
                                    ...traceDataContent
                                ]
                            },
                            margin: [0, 0, 0, 0],
                            layout: {
                                hLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                                vLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                                hLineColor: function (i, node) {
                                    return pdfMakeConfig.combinedReportBodyTableBorderColor;
                                },
                                vLineColor: function (i, node) {
                                    return pdfMakeConfig.combinedReportBodyTableBorderColor;
                                },
                                paddingLeft: function (i, node) {
                                    return i === 0 || i === 1 || i === 3 || i === 4 ? 0 : 5;
                                },
                                paddingRight: function (i, node) {
                                    return 0;
                                },
                                paddingTop: function (i, node) {
                                    return 0;
                                },
                                paddingBottom: function (i, node) {
                                    return 0;
                                }
                            },
                        },
                    );

                    if (i < reportData.length - 1) {
                        allContent.push({text: "", pageBreak: "before"});
                    }
                });
            }
            else {
                allContent.push(
                    {
                        table: {
                            headerRows: 2,
                            widths: [97, 98, 75, 97, 95, 75, 97, 97],  // Explicitly set widths
                            body: [
                                [
                                    {
                                        "text": getValue('lblTraceMaterialHeader'),
                                        "style": "tableHeader",
                                        "colSpan": 5,
                                        "fillColor": "#A6A6A6",
                                        margin: [5, 2, 0, 2],
                                        "alignment": "center"
                                    },
                                    {}, {}, {}, {},
                                    {
                                        "text": getValue('lblTracePreparation'),
                                        "style": "tableHeader",
                                        "colSpan": 3,
                                        "fillColor": "#A6A6A6",
                                        margin: [5, 2, 0, 2],
                                        "alignment": "center"
                                    },
                                    {}, {}
                                ],
                                [
                                    {
                                        "text": getValue('lblTraceMaterial'),
                                        "style": "tableHeader",
                                        "fillColor": "#D6DCE5",
                                        margin: [5, 2, 0, 2],
                                        "alignment": "center"
                                    },
                                    {
                                        "text": getValue('lblTraceSN'),
                                        "style": "tableHeader",
                                        "fillColor": "#D6DCE5",
                                        margin: [5, 2, 0, 2],
                                        "alignment": "center"
                                    },
                                    {
                                        "text": " + ",
                                        "style": "tableHeader",
                                        "alignment": "center",
                                        "fillColor": "#9DC3E6",
                                        margin: [0, 2, 0, 0],
                                    },
                                    {
                                        "text": getValue('lblTraceRawMaterialsMaterials'),
                                        "style": "tableHeader",
                                        "fillColor": "#DEEBF7",
                                        margin: [5, 2, 0, 2],
                                        "alignment": "center"
                                    },
                                    {
                                        "text": getValue('lblTraceSN'),
                                        "style": "tableHeader",
                                        "fillColor": "#DEEBF7",
                                        margin: [5, 2, 0, 2],
                                        "alignment": "center"
                                    },
                                    {
                                        "text": " = ",
                                        "style": "tableHeader",
                                        "alignment": "center",
                                        "fillColor": "#9DC3E6",
                                        margin: [0, 2, 0, 0],
                                    },
                                    {
                                        "text": getValue('lblTraceFinishedProduct'),
                                        "style": "tableHeader",
                                        "fillColor": "#DAE3F3",
                                        "alignment": "center",
                                        margin: [0, 2, 0, 0],
                                    },
                                    {"text": getValue('lblTraceSN'), "style": "tableHeader", "fillColor": "#DAE3F3",margin: [0, 2, 0, 0], "alignment": "center"}
                                ],
                            ]
                        },
                        margin: [0, 0, 0, 0],
                        layout: {
                            hLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                            vLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                            hLineColor: function (i, node) {
                                return pdfMakeConfig.combinedReportBodyTableBorderColor;
                            },
                            vLineColor: function (i, node) {
                                return pdfMakeConfig.combinedReportBodyTableBorderColor;
                            },
                            paddingLeft: function (i, node) {
                                return i === 0 || i === 1 || i === 3 || i === 4 ? 0 : 5;
                            },
                            paddingRight: function (i, node) {
                                return 0;
                            },
                            paddingTop: function (i, node) {
                                return 0;
                            },
                            paddingBottom: function (i, node) {
                                return 0;
                            }
                        },
                        pageHeaderText:getValue('lblTrace'),
                    }
                );
            }
        },

        // A method to generate Product report using pdfMake
        prepareProductsReportContent: function (reportData, header) {
            let pdfMakeConfig = getValue('pdfMakeConfig');
            if (allContent.length > 0) {
                allContent.push({text: "", pageBreak: "before"});
            }
            allContent.push({
                table: {
                    headerRows: 1,
                    widths: [158, 155, 82, 98, 105, 105], // 13 columns
                    body: [
                        [
                            {text: getValue('lblCustomPro'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center"},
                            {text: getValue('lblLotNumber'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center"},
                            {text: getValue('lblProductName'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center"},
                            {text: getValue('lblLotRegDate'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center"},
                            {text: getValue('lblWorkStartDate'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center"},
                            {text: getValue('lblWOrkEndDate'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center"},
                        ],
                        ...reportData.map(item => [
                            item[0],
                            item[1],
                            typeof item[2] === 'object' && item[2] !== null ? pdfReport.insertSpaces(item[2].text, 27) : pdfReport.insertSpaces(item[2], 27),
                            item[3],
                            item[4],
                            item[5]
                        ]),
                    ],
                },
                layout: {
                    hLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                    vLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                    hLineColor: function (i, node) {
                        return pdfMakeConfig.combinedReportBodyTableBorderColor;
                    },
                    vLineColor: function (i, node) {
                        return pdfMakeConfig.combinedReportBodyTableBorderColor;
                    },
                },
                headerStyles: {
                    bold: true,
                },
                margin: [0, 0, 0, 0],
                pageHeaderText: header.title,
            });
        },

        // A method to generate Machines report using pdfMake
        prepareMachinesReportContent: function (reportData, header) {
            let pdfMakeConfig = getValue('pdfMakeConfig');
            if (allContent.length > 0) {
                allContent.push({text: "", pageBreak: "before"});
            }
            allContent.push({
                table: {
                    headerRows: 1,
                    widths: [95, 96, 50, 85, 97, 177, 94], // 7 columns
                    body: [
                        [
                            {text: getValue('lblMachineName'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center"},
                            {text: getValue('lblMachineNumber'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center"},
                            {text: getValue('lblMachinePartNumber'),style: "tableHeader", fillColor: "#A9D08E", alignment: "center"},
                            {text: getValue('lblMachineMaker'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center"},
                            {text: getValue('lblMachineSerialNO'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center"},
                            {text: getValue('lblMachineReadTime'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center"},
                            {text: getValue('lblMachineRoomName'), style: "tableHeader", fillColor: "#A9D08E", alignment: "center"},
                        ],
                        ...reportData,
                    ],
                },
                layout: {
                    hLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                    vLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                    hLineColor: function (i, node) {
                        return pdfMakeConfig.combinedReportBodyTableBorderColor;
                    },
                    vLineColor: function (i, node) {
                        return pdfMakeConfig.combinedReportBodyTableBorderColor;
                    },
                },
                headerStyles: {
                    bold: true,
                },
                margin: [0, 0, 0, 0],
                pageHeaderText: header.title,
            });
        },

        // A method to generate Images report using pdfMake
        prepareImagesReportContent: function (reportData) {
            const pdfMakeConfig = getValue('pdfMakeConfig');
            if (allContent.length > 0) {
                allContent.push({text: "", pageBreak: "before"});
            }
            if(reportData.length > 0){
                reportData.forEach((image, index) => {
                    const newLeftSize = pdfReport.imageResize(image.data.left.width, image.data.left.height, pdfMakeConfig.combinedReportImageWidth, pdfMakeConfig.combinedReportImageHeight);
                    const newRightSize = pdfReport.imageResize(image.data.right ? image.data.right.width : pdfMakeConfig.combinedReportImageWidth, image.data.right ? image.data.right.height : pdfMakeConfig.combinedReportImageHeight, pdfMakeConfig.combinedReportImageWidth, pdfMakeConfig.combinedReportImageHeight);

                    allContent.push(
                        {
                            table: {
                                widths: [198, 198, 198], // total width 772
                                body: image.common, // Use the tableBody array
                            },
                            margin: [69, 0, 70, 0], // total width 772
                            layout: {
                                // Custom layout to show only the outer border
                                hLineWidth: function (i, node) {
                                    return i === 0 || i === node.table.body.length ? 1 : 0; // Return line width 2 at the top and bottom of the table
                                },
                                vLineWidth: function (i, node) {
                                    return i === 0 || i === node.table.widths.length ? 1 : 0; // Return line width 2 at the left and right of the table
                                },
                                hLineColor: function (i, node) {
                                    return "black"; // Color of horizontal lines
                                },
                                vLineColor: function (i, node) {
                                    return "black"; // Color of vertical lines
                                },
                                paddingTop: function (i, node) {
                                    return 4;
                                }, // Optional: space between cell border and text
                                paddingBottom: function (i, node) {
                                    return 4;
                                }, // Optional: space between cell border and text
                            },
                            pageHeaderText: image.header.title // Custom Key: Use for the header text
                        },
                        {
                            table: {
                                widths: [338, 52, 338],
                                body: [
                                    [
                                        pdfReport.isValidBase64Image(image.data.left.image) ? {
                                            image: image.data.left.image,
                                            width: newLeftSize.width,
                                            height: newLeftSize.height,
                                            alignment: "left",
                                            margin: [0, 0, 0, 0],
                                            border: [false, false, false, false],
                                        } : {
                                            text: '',
                                            border: [false, false, false, false]
                                        },
                                        {
                                            text: "", border: [false, false, false, false],
                                        },
                                        image.data.right !== undefined && image.data.right.image && pdfReport.isValidBase64Image(image.data.right.image) ? {
                                            image: image.data.right.image,
                                            width: newRightSize.width,
                                            height: newRightSize.height,
                                            alignment: "left",
                                            margin: [0, 0, 0, 0],
                                            border: [false, false, false, false]
                                        } : {
                                            text: '',
                                            border: [false, false, false, false]
                                        },
                                    ],
                                    [
                                        {
                                            text: '',
                                            style: "",
                                            colSpan: 3,
                                            border: [false, false, false, false],
                                            margin: [0, 5, 0, 5],
                                        },
                                        {}, {},
                                    ],
                                    [
                                        {
                                            text: [
                                                { text: getValue('imageReportTitle'), style: 'tableHeader',  decoration: 'underline', decorationStyle: 'solid', decorationThickness: 1, lineHeight: 1.5},
                                                { text: ': ' +image.data.left.title, style: 'imageTitleValueText' }
                                            ],
                                            alignment: 'left'
                                        },
                                        {
                                            text: "", border: [false, false, false, false],
                                        },
                                        {
                                            text: image.data.right ? [
                                                { text: getValue('imageReportTitle'), style: 'tableHeader', decoration: 'underline', decorationStyle: 'solid', decorationThickness: 1, lineHeight: 1.5 },
                                                { text: ': ' +image.data.right.title, style: 'imageTitleValueText' }
                                            ] : '',
                                            alignment: "left",
                                            border: image.data.right ? [true, true, true, true] : [false, false, false, false]
                                        },
                                    ],
                                    [
                                        {
                                            text: '',
                                            style: "",
                                            colSpan: 3,
                                            border: [false, false, false, false],
                                            margin: [0, 2, 0, 2],
                                        },
                                        {},
                                        {},
                                    ],
                                    [
                                        {
                                            text: [
                                                { text: `${getValue('lblImageRegistrationDate')}`, style: 'tableHeader', decoration: 'underline', decorationStyle: 'solid',decorationThickness: 1, lineHeight: 1.5 },
                                                { text: `: ${image.data.left.uploadedAt}  `,style: 'imageTitleValueText' },
                                                { text: `${getValue('lblImageRegisteredPerson')}`, style: 'tableHeader', decoration: 'underline', decorationStyle: 'solid',decorationThickness: 1, lineHeight: 1.5 },
                                                { text: `: ${image.data.left.uploadedBy}`,style: 'imageTitleValueText' }
                                            ],
                                            alignment: "left",
                                        },
                                        {
                                            text: "", border: [false, false, false, false],
                                        },
                                        {
                                            text: image.data.right ? [
                                                { text: `${getValue('lblImageRegistrationDate')}`, style: 'tableHeader', decoration: 'underline', decorationStyle: 'solid',decorationThickness: 1, lineHeight: 1.5 },
                                                { text: `: ${image.data.right.uploadedAt}  `, style: 'imageTitleValueText'},
                                                { text: `${getValue('lblImageRegisteredPerson')}`, style: 'tableHeader', decoration: 'underline', decorationStyle: 'solid',decorationThickness: 1, lineHeight: 1.5 },
                                                { text: `: ${image.data.right.uploadedBy}`, style: 'imageTitleValueText'}
                                            ] : '',
                                            alignment: "left",
                                            border: image.data.right ? [true, true, true, true] : [false, false, false, false]
                                        },
                                    ],
                                ],
                         },
                            margin: [0 , 20, 0, 5],
                        }
                    );
                    if (index < reportData.length - 1) {
                        allContent.push({text: "", pageBreak: "before"});
                    }
                });
            }else{
                allContent.push(
                    {
                        text: ' ',
                        style: "header",
                        margin: [0, 10, 0, 20],
                        pageHeaderText: getValue('lblImage'),
                    }
                );
            }
        },

        // Generate and download the report using pdfMake
        generateReportUsingPdfMake: function (response, documentName) {
            allContent = [];
            pdfMake.fonts = {
                ipamp: {
                    normal: "ipamp.ttf",
                    bold: "ipamp.ttf",
                    italics: "ipamp.ttf",
                    bolditalics: "ipamp.ttf",
                },
                NotoSansCJKJPBold: {
                    normal: "NotoSansJP-Bold[wght].ttf",
                    bold: "NotoSansJP-Bold[wght].ttf",
                    italics: "NotoSansJP-Bold[wght].ttf",
                    bolditalics: "NotoSansJP-Bold[wght].ttf",
                },
            };
            // Include Base64 font file
            pdfMake.vfs["ipamp.ttf"] = getIpampFontBase64();
            pdfMake.vfs["NotoSansJP-Bold[wght].ttf"] = getNotoFontBoldBase64();
            // Work Execution Report------------------------------
            if (response.data.workExecution && Object.keys(response.data.workExecution).length > 0) {
                const reports = response.data.workExecution;
                pdfReport.prepareWorkExecutionReportContent(reports.workExecutionReport, reports.header);
            }

            // Material (Cell) Section:-----------------------
            if (response.data.cell && Object.keys(response.data.cell).length > 0) {
                const reports = response.data.cell;
                pdfReport.prepareMaterialsReportContent(reports.cell, reports.header);
            }

            // Raw/General Material (Reagent/Consumables) Section:-----------------------
            if (response.data.reagentConsumables && Object.keys(response.data.reagentConsumables).length > 0) {
                const reports = response.data.reagentConsumables;
                pdfReport.prepareRawGeneralMaterialsReportContent(reports.reagentConsumables, reports.header);
            }

            // Material Label (Cell Label) Section:-----------------------
            if (response.data.cellLabel && Object.keys(response.data.cellLabel).length > 0) {
                const reports = response.data.cellLabel;
                pdfReport.prepareMaterialLabelReportContent(reports.cellLabel, reports.header);
            }

            // Raw/General Material Label (Reagent/Consumables Label) Section:-----------------------
            if (response.data.reagentConsumableLabel && Object.keys(response.data.reagentConsumableLabel).length > 0) {
                const reports = response.data.reagentConsumableLabel;
                pdfReport.prepareRawGeneralMaterialLabelReportContent(reports.reagentConsumableLabel, reports.header);
            }

            // Trace Report--------------------------
            if (response.data.traces) {
                pdfReport.prepareTraceReportContent(response.data.traces);
            }

            // Products Report--------------------------
            if (response.data.products && Object.keys(response.data.products).length > 0) {
                const reports = response.data.products;
                pdfReport.prepareProductsReportContent(reports.products, reports.header);
            }

            // Machines Report--------------------------
            if (response.data.machines && Object.keys(response.data.machines).length > 0) {
                const reports = response.data.machines;
                pdfReport.prepareMachinesReportContent(reports.machines, reports.header);
            }

            // Image Report--------------------------
            if (response.data.images) {
                const reports = response.data.images;
                pdfReport.prepareImagesReportContent(reports);
            }
            const pdfMakeConfig = getValue('pdfMakeConfig');
            const defaultFontSize = response.data?.report_screen == 'work_execution_report' ? pdfMakeConfig.combinedReportDataFontSize : pdfMakeConfig.singleReportDataFontSize;
            const docName = response.data.reportHeader.docName;
            const pageTopmargin = docName.length > 38 ? 130 : 110;
            const headerTopmargin = docName.length > 38 ? 75 : 75;
            // Define the document
            const docDefinition = {
                pageOrientation: "landscape",
                pageMargins: [43, pageTopmargin, 30, 30],
                content: allContent,
                footer: function (currentPage, pageCount) {
                    if (response.data?.report_screen != 'work_execution_report') {
                        return {
                            margin: [40, 0, 40, 20],
                            stack: [
                                {
                                    columns: [
                                        {
                                            text: currentPage.toString() + " / " + pageCount,
                                            alignment: "right",
                                        },
                                    ]
                                },
                            ]
                        };
                    } else {
                        return false;
                    }
                },
                styles: {
                    reportTitle: {
                        fontSize: pdfMakeConfig.combinedReportTitleFontSize,
                        font:  "ipamp",
                    },
                    reportTitleSubTable: {
                        fontSize:  pdfMakeConfig.combinedReportDocumentInfoFontSize,
                        font:  "ipamp",
                        bold: false
                    },
                    reportDocTitleSubTable: {
                        fontSize: response.data?.report_screen == 'work_execution_report' ? pdfMakeConfig.combinedReportDocumentInfoFontSize : pdfMakeConfig.singleReportDocumentInfoFontSize,
                        font: "ipamp",
                        bold: false
                    },
                    tableHeader: {
                        font: "ipamp",
                    },
                    headerText: {
                        bold: true,
                    },
                    underlinedText: {
                        font: "ipamp",
                        decoration: 'underline',  // Apply text underline
                        decorationStyle: 'solid',  // Optional: style of the underline (solid, double, dotted, dashed)
                        // decorationColor: '#ddd',  // Optional: color of the underline
                    },
                    traceSeparator: {
                        font: "ipamp",
                    },
                    traceReportText:{
                        // decoration: 'underline',
                        font: "ipamp",
                    },
                    boldStyle:{
                        font: "ipamp",
                        decorationThickness: 1, 
                        lineHeight: 1.5
                    },
                    imageTitleValueText:{
                        font: "ipamp"
                    },
                    documentInfoTable:{
                        font: "ipamp",
                        fontSize: pdfMakeConfig.combinedReportDocumentInfoFontSize,
                    },
                    tableImageHeader: {
                        fontSize: pdfMakeConfig.combinedReportSubTitleFontSize,
                    }
                },
                defaultStyle: {
                    font: "ipamp",
                    fontSize: defaultFontSize,
                },
            };

            docDefinition.header = function (currentPage, pageCount) {
                if(response.data?.report_screen == 'work_execution_report'){
                    let pageHeader = {
                        table: {
                            widths: [220.6, 340.8, 245.6], // Adjust column widths
                            body: [
                                [
                                    {text: '', style: '',},
                                    {text: '', alignment: 'center', style: 'reportTitle', layout: 'noBorders'},
                                    {
                                        table: {
                                            widths: [32.52, 40.67, 20.89,  20.52 ],
                                            body: [
                                                [
                                                    {text: getValue('lblReportDocumentNumber'), style: 'documentInfoTable'},
                                                    {text: response.data.reportHeader.docName, style: 'documentInfoTable', colSpan: 3, margin: [1, 1, 5, 1]},
                                                    {}, {}, // Empty cells to span
                                                ],
                                                [
                                                    {text: getValue('lblReportLotNo'), style: 'documentInfoTable'},
                                                    {text: response.data.reportHeader.lotCode, style: 'documentInfoTable'},
                                                    {text: getValue('lblReportPageNo'), style: 'documentInfoTable'},
                                                    {text: `${currentPage}/${pageCount}`, style: 'documentInfoTable'}
                                                ]
                                            ]
                                        },
                                        margin: [59, 0, 0, 0],
                                        layout: {
                                            hLineWidth: function() { return pdfMakeConfig.combinedReportDocumentTableBorderWidthHorizontal; },
                                            vLineWidth: function() { return pdfMakeConfig.combinedReportDocumentTableBorderWidth; },
                                            hLineColor: function (i, node) {
                                                return pdfMakeConfig.combinedReportDocumentTableBorderColor;
                                            },
                                            vLineColor: function (i, node) {
                                                return pdfMakeConfig.combinedReportDocumentTableBorderColor;
                                            },
                                        },
                                    }
                                ]
                            ]
                        },
                        margin: [30, headerTopmargin, 30, 0], // Adjust header margins [left, top, right, bottom]
                        layout: {
                            hLineWidth: function (i, node) {
                                return 0;
                            }, // Main table horizontal line width
                            vLineWidth: function (i, node) {
                                return 0;
                            }, // Main table vertical line width
                            paddingLeft: function (i, node) {
                                return 0;
                            },
                            paddingRight: function (i, node) {
                                return 0;
                            },
                            paddingTop: function (i, node) {
                                return 0;
                            },
                            paddingBottom: function (i, node) {
                                return 0;
                            }
                        },
                    };
                    //Dynamically find the header title based on content
                    for (var l = 0; l < docDefinition.content.length; l++) {
                        if (docDefinition.content[l].pageHeaderText && currentPage >= docDefinition.content[l].positions[0].pageNumber) {
                            pageHeader.table.body[0][1].text = docDefinition.content[l].pageHeaderText;
                        }
                    }

                    return pageHeader;
                }else{

                    let pageHeader = {
                        table: {
                            widths: [200.6, 300.8, 200.6], // Adjust column widths
                            body: [
                                [
                                    {text: '', style: 'documentInfoTable'},
                                    {text: response.data.reportHeader.title, alignment: 'center', style: 'reportTitle', layout: 'noBorders',},
                                    {
                                        table: {
                                            widths: [252.6],
                                            body: [
                                                [
                                                    {
                                                        text: `${getValue('lblReportDocumentNumber')}: ${response.data.reportHeader.docName}`,
                                                        style: 'reportDocTitleSubTable',
                                                        alignment:'right',
                                                        margin: [2, 0, 10, 0],
                                                    },
                                                ],
                                            ]
                                        },
                                        layout: 'noBorders',
                                    }
                                ]
                            ]
                        },
                        fontSize: 15,
                        margin: [30, headerTopmargin, 30, 50], // Adjust header margins [left, top, right, bottom]
                        layout: 'noBorders',
                    }
                    //Dynamically find the header title based on content
                    for (var l = 0; l < docDefinition.content.length; l++) {
                        if (docDefinition.content[l].pageHeaderText && currentPage >= docDefinition.content[l].positions[0].pageNumber) {
                            pageHeader.table.body[0][1].text = docDefinition.content[l].pageHeaderText;
                        }
                    }
                    return pageHeader;
                }
            };

            // Generate and open the PDF
            const d = new Date();
            const formattedDate = formatDateForFilename(d);
            const filename = `${documentName}-${formattedDate}.pdf`;
            //pdfMake.createPdf(docDefinition).open();
            pdfMake.createPdf(docDefinition).download(filename);
        },

        /*
        * Record Output: --------------------------
        * From here, the methods are used to generate reports from the record output section
        * */
        // Trace Report
        generateTraceReportFromRecordOutput: function (response, documentName) {
            const traceContent = [];
            const pdfMakeConfig = getValue('pdfMakeConfig');
            const pageTopmarginTrace = response.data.reportHeader.docName.length > 38 ? 130 : 110;
            const headerTopmarginTrace = response.data.reportHeader.docName.length > 38 ? 75 : 75;

            pdfMake.fonts = {
                ipamp: {
                    normal: "ipamp.ttf",
                    bold: "ipamp.ttf",
                    italics: "ipamp.ttf",
                    bolditalics: "ipamp.ttf",
                },
                NotoSansCJKJPBold: {
                    normal: "NotoSansJP-Bold[wght].ttf",
                    bold: "NotoSansJP-Bold[wght].ttf",
                    italics: "NotoSansJP-Bold[wght].ttf",
                    bolditalics: "NotoSansJP-Bold[wght].ttf",
                },
            };
            // Include Base64 font file
            pdfMake.vfs["ipamp.ttf"] = getIpampFontBase64();
            pdfMake.vfs["NotoSansJP-Bold[wght].ttf"] = getNotoFontBoldBase64();
            if(response.data.trace.length > 0){
                response.data.trace.forEach((traceData, i) => {
                    let traceDataContent = traceData?.content?.length ? traceData.content.map((trace) => [
                        // Material Name Section
                        {
                            table: {
                                widths: [113, 85],
                                body: trace['materials']?.length ? trace['materials'].flatMap((material, index, array) => [
                                    [
                                        {text: material['name'], margin: [2, 0, 0, 0]},
                                        {text: material['sn'].join('\n'), margin: [2, 0, 0, 0]}
                                    ],
                                    ...(index < array.length - 1 ? [[
                                        {
                                            colSpan: 2,
                                            margin: [0, 0, 0, 0],
                                            canvas: [
                                                {type: "line", x1: 0, y1: 0, x2: 207, y2: 0, lineWidth: pdfMakeConfig.combinedReportBodyTableBorderWidth, lineColor: pdfMakeConfig.combinedReportBodyTableBorderColor}
                                            ]
                                        },
                                        {} // Empty cell for colSpan
                                    ]] : [])
                                ]) : [[]] // Ensure rawGeneralMaterials exists and map over it
                            },
                            layout: "noBorders",
                        },
                        {},
                        // Plus Section
                        {"text": " + ", "style": "tableHeader", "alignment": "center", margin: [-4, 0, 0, 0]},
                        // Raw/General Materials Section
                        {
                            table: {
                                widths: [186, 85],
                                body: trace['rawGeneralMaterials']?.length ? trace['rawGeneralMaterials'].flatMap((material, index, array) => [
                                    [
                                        {text: material['name'], margin: [2, 0, 0, 0]},
                                        {text: material['sn'].join('\n'), margin: [2, 0, 0, 0],}
                                    ],
                                    ...(index < array.length - 1 ? [[
                                        {
                                            colSpan: 2,
                                            margin: [0, 0, 0, 0],
                                            canvas: [
                                                {type: "line", x1: 0, y1: 0, x2: 281, y2: 0, lineWidth: pdfMakeConfig.combinedReportBodyTableBorderWidth, lineColor: pdfMakeConfig.combinedReportBodyTableBorderColor}
                                            ]
                                        },
                                        {} // Empty cell for colSpan
                                    ]] : [])
                                ]) : [[]] // Ensure rawGeneralMaterials exists and map over it
                            },
                            layout: "noBorders",
                            //layout: "lightHorizontalLines",
                        },
                        {},
                        // Equal Section
                        {text: " = ", style: "tableHeader", alignment: "center", margin: [-4, 0, 0, 0]},
                        // Final Product Section
                        {text: trace['finalProduct']['name'], alignment:"left", margin: [-2, 0, 0, 0],},
                        {text: trace['finalProduct']['sn'].join('\n'),alignment:"left", margin: [-2, 0, 0, 0],}
                    ]) : [];
                        traceContent.push(
                            // header
                            {
                                table: {
                                    headerRows: 1,
                                    widths: [241, 243, 240],  // Explicitly set widths
                                    body: [
                                        [
                                            {
                                                "text": [
                                                    { "text": `${getValue('lblTraceProjectCode')}`, "style": "underlinedText" },
                                                    { "text": ` : `, "style": "traceSeparator" },
                                                    { "text": traceData.common.projectCode, "style": "underlinedText"  }
                                                ],
                                                "border": [true, true, false, false],
                                            },
                                            {
                                                "text": [
                                                    { "text": `${getValue('lblTraceProjectName')}`, "style": "underlinedText" },
                                                    { "text": ` : `, "style": "traceSeparator"},
                                                    { "text": traceData.common.projectName, "style": "underlinedText"  }
                                                ],
                                                "border": [false, true, false, false]
                                            },
                                            {
                                                "text": [
                                                    { "text": `${getValue('lblTraceIdentifyingNumber')}`, "style": "underlinedText" },
                                                    { "text": ` : `, "style": "traceSeparator"},
                                                    { "text": traceData.common.lotCode, "style": "underlinedText"  }
                                                ],
                                                "border": [false, true, true, false]
                                            },
                                        ],
                                        [
                                            {
                                                "text": [
                                                    { "text": `${getValue('lblTraceProcessName')}`, "style": "underlinedText" },
                                                    { "text": ` : `, "style": "traceSeparator"},
                                                    { "text": traceData.common.processName, "style": "underlinedText"  }
                                                ],
                                                "border": [true, false, false, false]
                                            },
                                            {
                                                "text": [
                                                    { "text": `${getValue('lblTraceStepName')}`, "style": "underlinedText" },
                                                    { "text": ` : `, "style": "traceSeparator"},
                                                    { "text": traceData.common.stepName, "style": "underlinedText"  }
                                                ],
                                                "border": [false, false, false, false]
                                            },
                                            {"text": "", "style": "underlinedText", "border": [false, false, true, false]},
                                        ],
                                        [
                                            {
                                                "text": [
                                                    { "text": `${getValue('lblTraceWorkingDay')}`, "style": "underlinedText" },
                                                    { "text": ` : `, "style": "traceSeparator"},
                                                    { "text": traceData.common.workingDay, "style": "underlinedText"  }
                                                ],
                                                "colSpan": 3,
                                                "border": [true, false, true, true]
                                            },
                                            {}, {},
                                        ],
                                    ]
                                },
                                margin: [0, 0, 0, 0],
                                layout: {
                                    hLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                                    vLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                                    hLineColor: function (i, node) {
                                        return pdfMakeConfig.combinedReportBodyTableBorderColor;
                                    },
                                    vLineColor: function (i, node) {
                                        return pdfMakeConfig.combinedReportBodyTableBorderColor;
                                    },
                                    paddingLeft: function (i, node) {
                                        return 5;
                                    },
                                    paddingRight: function (i, node) {
                                        return 5;
                                    },
                                    paddingTop: function (i, node) {
                                        return 5;
                                    },
                                    paddingBottom: function (i, node) {
                                        return 5;
                                    }
                                },
                                pageHeaderText: traceData.header.title // Custom Key: Use for the header text
                            },
                            // Data Table
                            {
                                table: {
                                    headerRows: 2,
                                    widths: [120, 86, 9, 193, 87, 9, 146, 80],  // Explicitly set widths
                                    body: [
                                        [
                                            {
                                                "text": getValue('lblTraceMaterialHeader'),
                                                "style": "tableHeader",
                                                "colSpan": 5,
                                                "fillColor": "#A6A6A6",
                                                margin: [5, 2, 0, 2],
                                                "alignment": "center"
                                            },
                                            {}, {}, {}, {},
                                            {
                                                "text": getValue('lblTracePreparation'),
                                                "style": "tableHeader",
                                                "colSpan": 3,
                                                "fillColor": "#A6A6A6",
                                                margin: [5, 2, 0, 2],
                                                "alignment": "center"
                                            },
                                            {}, {}
                                        ],
                                        [
                                            {
                                                "text": getValue('lblTraceMaterial'),
                                                "style": "tableHeader",
                                                "fillColor": "#D6DCE5",
                                                margin: [5, 2, 0, 2],
                                                "alignment": "center"
                                            },
                                            {
                                                "text": getValue('lblTraceSN'),
                                                "style": "tableHeader",
                                                "fillColor": "#D6DCE5",
                                                margin: [5, 2, 0, 2],
                                                "alignment": "center"
                                            },
                                            {
                                                "text": " + ",
                                                "style": "tableHeader",
                                                "alignment": "center",
                                                "fillColor": "#9DC3E6",
                                                margin: [-4, 0, 0, 0]
                                            },
                                            {
                                                "text": getValue('lblTraceRawMaterialsMaterials'),
                                                "style": "tableHeader",
                                                "fillColor": "#DEEBF7",
                                                margin: [5, 2, 0, 2],
                                                "alignment": "center"
                                            },
                                            {
                                                "text": getValue('lblTraceSN'),
                                                "style": "tableHeader",
                                                "fillColor": "#DEEBF7",
                                                margin: [5, 2, 0, 2],
                                                "alignment": "center"
                                            },
                                            {
                                                "text": " = ",
                                                "style": "tableHeader",
                                                "alignment": "center",
                                                "fillColor": "#9DC3E6",
                                                margin: [-4, 0, 0, 0]
                                            },
                                            {
                                                "text": getValue('lblTraceFinishedProduct'),
                                                "style": "tableHeader",
                                                "fillColor": "#DAE3F3",
                                                "alignment": "center",
                                                margin: [0, 2, 0, 0],
                                            },
                                            {
                                                "text": getValue('lblTraceSN'),
                                                "style": "tableHeader",
                                                "fillColor":"#DAE3F3",
                                                margin: [0, 2, 0,0],
                                                "alignment": "center"
                                            }
                                        ],
                                        ...traceDataContent
                                    ]
                                },
                                margin: [0, 0, 0, 0],
                                layout: {
                                    hLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                                    vLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                                    hLineColor: function (i, node) {
                                        return pdfMakeConfig.combinedReportBodyTableBorderColor;
                                    },
                                    vLineColor: function (i, node) {
                                        return pdfMakeConfig.combinedReportBodyTableBorderColor;
                                    },
                                    paddingLeft: function (i, node) {
                                        return i === 0 || i === 1 || i === 3 || i === 4 ? 0 : 5;
                                    },
                                    paddingRight: function (i, node) {
                                        return 0;
                                    },
                                    paddingTop: function (i, node) {
                                        return 0;
                                    },
                                    paddingBottom: function (i, node) {
                                        return 0;
                                    }
                                },
                            },
                        );

                    if (i < response.data.trace.length - 1) {
                        traceContent.push({text: "", pageBreak: "before"});
                    }
                });
            }
            else{
                traceContent.push(
                    {
                        table: {
                            headerRows: 2,
                            widths: [97, 98, 75, 97, 95, 75, 97, 97],  // Explicitly set widths
                            body: [
                                [
                                    {
                                        "text": getValue('lblTraceMaterialHeader'),
                                        "style": "tableHeader",
                                        "colSpan": 5,
                                        "fillColor": "#A6A6A6",
                                        margin: [5, 2, 0, 2],
                                        "alignment": "center"
                                    },
                                    {}, {}, {}, {},
                                    {
                                        "text": getValue('lblTracePreparation'),
                                        "style": "tableHeader",
                                        "colSpan": 3,
                                        "fillColor": "#A6A6A6",
                                        margin: [5, 2, 0, 2],
                                        "alignment": "center"
                                    },
                                    {}, {}
                                ],
                                [
                                    {
                                        "text": getValue('lblTraceMaterial'),
                                        "style": "tableHeader",
                                        "fillColor": "#D6DCE5",
                                        margin: [5, 2, 0, 2],
                                        "alignment": "center"
                                    },
                                    {
                                        "text": getValue('lblTraceSN'),
                                        "style": "tableHeader",
                                        "fillColor": "#D6DCE5",
                                        margin: [5, 2, 0, 2],
                                        "alignment": "center"
                                    },
                                    {
                                        "text": " + ",
                                        "style": "tableHeader",
                                        "alignment": "center",
                                        "fillColor": "#9DC3E6",
                                        margin: [0, 2, 0, 0],
                                    },
                                    {
                                        "text": getValue('lblTraceRawMaterialsMaterials'),
                                        "style": "tableHeader",
                                        "fillColor": "#DEEBF7",
                                        margin: [5, 2, 0, 2],
                                        "alignment": "center"
                                    },
                                    {
                                        "text": getValue('lblTraceSN'),
                                        "style": "tableHeader",
                                        "fillColor": "#DEEBF7",
                                        margin: [5, 2, 0, 2],
                                        "alignment": "center"
                                    },
                                    {
                                        "text": " = ",
                                        "style": "tableHeader",
                                        "alignment": "center",
                                        "fillColor": "#9DC3E6",
                                        margin: [0, 2, 0, 0],
                                    },
                                    {
                                        "text": getValue('lblTraceFinishedProduct'),
                                        "style": "tableHeader",
                                        "fillColor": "#DAE3F3",
                                        "alignment": "center",
                                        margin: [0, 2, 0, 0],
                                    },
                                    {"text": getValue('lblTraceSN'), "style": "tableHeader", "fillColor": "#DAE3F3", margin: [0, 2, 0, 0], "alignment": "center"}
                                ],
                            ]
                        },
                        margin: [0, 0, 0, 0],
                        layout: {
                            hLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                            vLineWidth: function() { return pdfMakeConfig.combinedReportBodyTableBorderWidth; },
                            hLineColor: function (i, node) {
                                return pdfMakeConfig.combinedReportBodyTableBorderColor;
                            },
                            vLineColor: function (i, node) {
                                return pdfMakeConfig.combinedReportBodyTableBorderColor;
                            },
                            paddingLeft: function (i, node) {
                                return i === 0 || i === 1 || i === 3 || i === 4 ? 0 : 5;
                            },
                            paddingRight: function (i, node) {
                                return 0;
                            },
                            paddingTop: function (i, node) {
                                return 0;
                            },
                            paddingBottom: function (i, node) {
                                return 0;
                            }
                        },
                        pageHeaderText:getValue('lblTrace'),
                    }
                );
            }
            // Define the document
            const docDefinition = {
                pageOrientation: "landscape", // Set the page orientation to landscape
                pageMargins: [42, pageTopmarginTrace, 30, 30],
                content: traceContent,
                header: function (currentPage, pageCount) {
                    return {
                        table: {
                            widths: [200.6, 302.8, 220.6], // Adjust column widths
                                body: [
                                        [
                                            {text: '', style: '',},
                                            {text: response.data.reportHeader.title, alignment: 'center', style: 'reportTitle', layout: 'noBorders',},
                                            {
                                                table: {
                                                    widths: [220.6],
                                                    body: [
                                                        [
                                                            {
                                                                text: `${getValue('lblReportDocumentNumber')}: ${response.data.reportHeader.docName}`,
                                                                style: 'reportTitleSubTable',
                                                                alignment:'right'
                                                            },
                                                        ],
                                                        [
                                                            {
                                                                text: `${getValue('lblTraceSystemDate')}: ${response.data.reportHeader.printDate}`,
                                                                style: 'reportTitleSubTable',
                                                                alignment:'right'
                                                            },
                                                        ]
                                                    ]
                                                },
                                                layout: 'noBorders',
                                            }
                                        ]
                                    ]
                             }
                        ,
                        margin: [60, headerTopmarginTrace, 30, 0], // Adjust header margins [left, top, right, bottom]
                        layout: 'noBorders',
                    }
                },
                footer: function (currentPage, pageCount) {
                    return {
                        margin: [40, 0, 40, 20],
                        stack: [
                            {
                                canvas: [
                                    {
                                        type: 'line',
                                        x1: 0, y1: 5,
                                        x2: 765, y2: 5,  // Line width can be adjusted by changing 'x2'
                                        lineWidth: pdfMakeConfig.combinedReportBodyTableBorderWidth,
                                        lineColor: pdfMakeConfig.combinedReportBodyTableBorderColor
                                    }
                                ]
                            },
                            {
                                columns: [
                                    {
                                        text: "Page " + currentPage.toString() + " / " + pageCount,
                                        alignment: "right",
                                    },
                                ]
                            },
                        ]
                    };
                },
                styles: {
                    reportTitle: {
                        fontSize: pdfMakeConfig.traceReportHeaderTitle,
                        font: "ipamp",
                    },
                    reportTitleSubTable: {
                        fontSize: pdfMakeConfig.singleReportDocumentInfoFontSize,
                        font: "ipamp",
                    },
                    tableHeader: {
                        font: "ipamp",
                    },
                    traceSeparator: {
                        font: "ipamp",
                    },
                    traceReportText:{
                        font: "ipamp",
                    },
                    underlinedText: {
                        font: "ipamp",
                        decoration: 'underline',  // Apply text underline
                        decorationStyle: 'solid',  // Optional: style of the underline (solid, double, dotted, dashed)
                        decorationColor: pdfMake.combinedReportBodyTableBorderColor,  // Optional: color of the underline
                    },
                },
                defaultStyle: {
                    font: "ipamp",
                    fontSize: pdfMakeConfig.traceReportDataContent,
                },
            };
            // Generate and open the PDF
            const d = new Date();
            const formattedDate = formatDateForFilename(d);
            const filename = `${documentName}-${formattedDate}.pdf`;
            pdfMake.createPdf(docDefinition).download(filename);
        },

        // Image Report
        generateImageReportFromRecordOutput: function (response, documentName) {
            const imageContent = [];
            const pdfMakeConfig = getValue('pdfMakeConfig');
            const pageTopmarginImage = response.data.reportHeader.docName.length > 38 ? 130 : 110;
            const headerTopmarginImage = response.data.reportHeader.docName.length > 38 ? 75 : 75;

            pdfMake.fonts = {
                ipamp: {
                    normal: "ipamp.ttf",
                    bold: "ipamp.ttf",
                    italics: "ipamp.ttf",
                    bolditalics: "ipamp.ttf",
                },
                NotoSansCJKJPBold: {
                    normal: "NotoSansJP-Bold[wght].ttf",
                    bold: "NotoSansJP-Bold[wght].ttf",
                    italics: "NotoSansJP-Bold[wght].ttf",
                    bolditalics: "NotoSansJP-Bold[wght].ttf",
                },
            };

            // Include Base64 font file
            pdfMake.vfs["ipamp.ttf"] = getIpampFontBase64();
            pdfMake.vfs["NotoSansJP-Bold[wght].ttf"] = getNotoFontBoldBase64();

            response.data.images.forEach((image, index) => {
                const newLeftSize = pdfReport.imageResize(image.data.left.width, image.data.left.height, pdfMakeConfig.combinedReportImageWidth, pdfMakeConfig.combinedReportImageHeight);
                const newRightSize = pdfReport.imageResize(image.data.right ? image.data.right.width : pdfMakeConfig.combinedReportImageWidth, image.data.right ? image.data.right.height : pdfMakeConfig.combinedReportImageHeight, pdfMakeConfig.combinedReportImageWidth, pdfMakeConfig.combinedReportImageHeight);

                imageContent.push(
                    {
                        table: {
                            widths: [198, 198, 198], // total width 772
                            body: image.common, // Use the tableBody array
                        },
                        margin: [67, 0, 70, 0], // total width 772
                        layout: {
                            // Custom layout to show only the outer border
                            hLineWidth: function (i, node) {
                                return i === 0 || i === node.table.body.length ? 1 : 0; // Return line width 2 at the top and bottom of the table
                            },
                            vLineWidth: function (i, node) {
                                return i === 0 || i === node.table.widths.length ? 1 : 0; // Return line width 2 at the left and right of the table
                            },
                            hLineColor: function (i, node) {
                                return "black"; // Color of horizontal lines
                            },
                            vLineColor: function (i, node) {
                                return "black"; // Color of vertical lines
                            },
                            paddingTop: function (i, node) {
                                return 4;
                            }, // Optional: space between cell border and text
                            paddingBottom: function (i, node) {
                                return 4;
                            }, // Optional: space between cell border and text
                        },
                        pageHeaderText: image.header.title // Custom Key: Use for the header text
                    },
                    {
                        table: {
                            widths: [338, 52, 338],
                            body: [
                                [
                                    pdfReport.isValidBase64Image(image.data.left.image) ? {
                                        image: image.data.left.image,
                                        width: newLeftSize.width,
                                        height: newLeftSize.height,
                                        alignment: "left",
                                        margin: [0, 0, 0, 0],
                                        border: [false, false, false, false],
                                    } : {
                                        text: '',
                                        border: [false, false, false, false]
                                    },
                                    {
                                        text: "", border: [false, false, false, false],
                                    },
                                    image.data.right !== undefined && image.data.right.image && pdfReport.isValidBase64Image(image.data.right.image) ? {
                                        image: image.data.right.image,
                                        width: newRightSize.width,
                                        height: newRightSize.height,
                                        alignment: "left",
                                        margin: [0, 0, 0, 0],
                                        border: [false, false, false, false]
                                    } : {
                                        text: '',
                                        border: [false, false, false, false]
                                    },
                                ],
                                [
                                    {
                                        text: '',
                                        style: "",
                                        colSpan: 3,
                                        border: [false, false, false, false],
                                        margin: [0, 5, 0, 5],
                                    },
                                    {}, {},
                                ],
                                [
                                    {
                                        text: [
                                            { text: getValue('imageReportTitle'), style: 'tableHeader',  decoration: 'underline', decorationStyle: 'solid',decorationThickness: 1, lineHeight: 1.5},
                                            { text: ': ' +image.data.left.title, style: 'imageTitleValueText' }
                                        ],
                                        alignment: 'left',
                                    },
                                    {
                                        text: "", border: [false, false, false, false],
                                    },
                                    {
                                        text: image.data.right ? [
                                            { text: getValue('imageReportTitle'), style: 'tableHeader', decoration: 'underline', decorationStyle: 'solid',decorationThickness: 1, lineHeight: 1.5 },
                                            { text: ': ' +image.data.right.title, style: 'imageTitleValueText' }
                                        ] : '',

                                        alignment: "left",
                                        border: image.data.right ? [true, true, true, true] : [false, false, false, false]
                                    },
                                ],
                                [
                                    {
                                        text: '',
                                        style: "",
                                        colSpan: 3,
                                        border: [false, false, false, false],
                                        margin: [0, 2, 0, 2],
                                    },
                                    {},
                                    {},
                                ],
                                [
                                    {
                                        text: [
                                            { text: `${getValue('lblImageRegistrationDate')}`, style: "tableHeader", decoration: 'underline', decorationStyle: 'solid',decorationThickness: 1, lineHeight: 1.5 },
                                            { text: `: ${image.data.left.uploadedAt}  `, style: 'imageTitleValueText' },
                                            { text: `${getValue('lblImageRegisteredPerson')}`, style: "tableHeader", decoration: 'underline', decorationStyle: 'solid',decorationThickness: 1, lineHeight: 1.5 },
                                            { text: `: ${image.data.left.uploadedBy}` , style: 'imageTitleValueText' }
                                        ],
                                        // style: "tableHeader",
                                        alignment: "left",
                                    },
                                    {
                                        text: "", border: [false, false, false, false],
                                    },
                                    {
                                        text: image.data.right ? [
                                            { text: `${getValue('lblImageRegistrationDate')}`,  style: "tableHeader", decoration: 'underline', decorationStyle: 'solid',decorationThickness: 1, lineHeight: 1.5 },
                                            { text: `: ${image.data.right.uploadedAt}  `,style: 'imageTitleValueText'},
                                            { text: `${getValue('lblImageRegisteredPerson')}`,  style: "tableHeader", decoration: 'underline', decorationStyle: 'solid',decorationThickness: 1, lineHeight: 1.5 },
                                            { text: `: ${image.data.right.uploadedBy}`,style: 'imageTitleValueText' }
                                        ] : '',
                                        // style: "tableHeader",
                                        alignment: "left",
                                        border: image.data.right ? [true, true, true, true] : [false, false, false, false]
                                    },
                                ],
                            ],
                        },
                        margin: [0 , 20, 0, 5],
                    }
                );

                if (index < response.data.images.length - 1) {
                    imageContent.push({text: "", pageBreak: "before"});
                }
            });


            // Define the document
            const docDefinition = {
                pageOrientation: "landscape", // Set the page orientation to landscape
                // pageMargins: [30, 60, 30, 30], // Adjust page margins [left, top, right, bottom]
                pageMargins: [43, pageTopmarginImage, 30, 30],
                content: imageContent,
                header: function (currentPage, pageCount) {
                    return {
                        table: {
                            widths: ['30%', '40%', '30%'], // Adjust column widths
                                body: [
                                        [
                                            {text: '', style: '',},
                                            {text: response.data.reportHeader.title, alignment: 'center', margin:[0,8,0,0], style: 'reportTitle', layout: 'noBorders',},
                                            {
                                                table: {
                                                    widths: ['100%'],
                                                    body: [
                                                        [
                                                            {
                                                                text: `${getValue('lblReportDocumentNumber')}: ${response.data.reportHeader.docName}`,
                                                                style: 'reportTitleSubTable',
                                                                alignment:'right'
                                                            },
                                                        ],
                                                        [
                                                            {
                                                                text: `${getValue('lblTraceSystemDate')}: ${response.data.reportHeader.printDate}`,
                                                                style: 'reportTitleSubTable',
                                                                alignment:'right'
                                                            },
                                                        ]
                                                    ]
                                                },
                                                layout: 'noBorders',
                                            }
                                        ]
                                    ]
                             }
                        ,
                        margin: [30, headerTopmarginImage, 30, 0], // Adjust header margins [left, top, right, bottom]
                        layout: 'noBorders',
                    }
                },
                footer: function (currentPage, pageCount) {
                    return {
                        margin: [40, 0, 40, 20],
                        stack: [
                            {
                                canvas: [
                                    {
                                        type: 'line',
                                        x1: 0, y1: 5,
                                        x2: 770, y2: 5,  // Line width can be adjusted by changing 'x2'
                                        lineWidth: 0.5
                                    }
                                ]
                            },
                            {
                                columns: [
                                    {
                                        text: "Page " + currentPage.toString() + " / " + pageCount,
                                        alignment: "right",
                                    },
                                ]
                            },
                        ]
                    };
                },
                styles: {
                    reportTitle: {
                        fontSize: pdfMakeConfig.imageReportHeaderTitle,
                        font: "ipamp",
                    },
                    reportTitleSubTable: {
                        fontSize: pdfMakeConfig.singleReportDocumentInfoFontSize,
                        font: "ipamp",
                    },
                    tableHeader: {
                        font: "ipamp",
                    },
                    imageTitleValueText:{
                        font: "ipamp"
                    },
                    boldStyle:{
                        font: "ipamp",

                    },
                    headerText: {
                        bold: true,
                    },
                    underlinedText: {
                        decoration: 'underline',  // Apply text underline
                        decorationColor: pdfMakeConfig.combinedReportBodyTableBorderColor,
                    },
                    tableImageHeader: {
                        fontSize: pdfMakeConfig.combinedReportSubTitleFontSize,
                    }
                },
                defaultStyle: {
                    font: "ipamp",
                    fontSize: pdfMakeConfig.imageReportFontSize,
                },
            };

            // Generate and open the PDF
            const d = new Date();
            const formattedDate = formatDateForFilename(d);
            const filename = `${documentName}-${formattedDate}.pdf`;
            pdfMake.createPdf(docDefinition).download(filename);
        },

        imageResize: function (originalWidth, originalHeight, maxWidth, maxHeight) {
            let newWidth;
            let newHeight;

            // Calculate the scaling factor while maintaining the aspect ratio
            const widthRatio = maxWidth / originalWidth;
            const heightRatio = maxHeight / originalHeight;
            const scaleFactor = Math.min(widthRatio, heightRatio);

            // Apply scaling
            newWidth = Math.round(originalWidth * scaleFactor);
            newHeight = Math.round(originalHeight * scaleFactor);

            return { width: newWidth, height: newHeight };
        },

        isValidBase64Image: function (base64Data) {
            if (!base64Data || base64Data.trim() === '' || base64Data.startsWith('data:image/webp;base64,')) return false;  // Checking for an empty or whitespace-only string
            // Basic validation to check it's a data URI and starts with 'data:image'
            const regex = /^\s*data:(image\/[^;]+;base64,)?[A-Za-z0-9+/]+={0,2}\s*$/;
            return regex.test(base64Data);
        }
    };
}();
