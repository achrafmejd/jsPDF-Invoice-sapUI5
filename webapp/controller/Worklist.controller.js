sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("project1.controller.Worklist", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit: function () {
            var oViewModel;

            // keeps the search state
            this._aTableSearchState = [];

            // Model used to manipulate control states
            oViewModel = new JSONModel({
                worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
                shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
                shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
                tableNoDataText: this.getResourceBundle().getText("tableNoDataText")
            });
            this.setModel(oViewModel, "worklistView");

        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Triggered by the table's 'updateFinished' event: after new table
         * data is available, this handler method updates the table counter.
         * This should only happen if the update was successful, which is
         * why this handler is attached to 'updateFinished' and not to the
         * table's list binding's 'dataReceived' method.
         * @param {sap.ui.base.Event} oEvent the update finished event
         * @public
         */
        onUpdateFinished: function (oEvent) {
            // update the worklist's object counter after the table update
            var sTitle,
                oTable = oEvent.getSource(),
                iTotalItems = oEvent.getParameter("total");
            // only update the counter if the length is final and
            // the table is not empty
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
            } else {
                sTitle = this.getResourceBundle().getText("worklistTableTitle");
            }
            this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
        },

        /**
         * Event handler when a table item gets pressed
         * @param {sap.ui.base.Event} oEvent the table selectionChange event
         * @public
         */
        onPress: function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },

        /**
         * Event handler for navigating back.
         * Navigate back in the browser history
         * @public
         */
        onNavBack: function () {
            // eslint-disable-next-line sap-no-history-manipulation
            history.go(-1);
        },


        onSearch: function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                // Search field's 'refresh' button has been pressed.
                // This is visible if you select any main list item.
                // In this case no new search is triggered, we only
                // refresh the list binding.
                this.onRefresh();
            } else {
                var aTableSearchState = [];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    aTableSearchState = [new Filter("Matricule", FilterOperator.Contains, sQuery)];
                }
                this._applySearch(aTableSearchState);
            }

        },

        /**
         * Event handler for refresh event. Keeps filter, sort
         * and group settings and refreshes the list binding.
         * @public
         */
        onRefresh: function () {
            var oTable = this.byId("table");
            oTable.getBinding("items").refresh();
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Shows the selected item on the object page
         * @param {sap.m.ObjectListItem} oItem selected Item
         * @private
         */
        _showObject: function (oItem) {
            this.getRouter().navTo("object", {
                objectId: oItem.getBindingContext().getPath().substring("/CARSHeadersSet".length)
            });
        },

        /**
         * Internal helper method to apply both filter and search state together on the list binding
         * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
         * @private
         */
        _applySearch: function (aTableSearchState) {
            var oTable = this.byId("table"),
                oViewModel = this.getModel("worklistView");
            oTable.getBinding("items").filter(aTableSearchState, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (aTableSearchState.length !== 0) {
                oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
            }
        },
        onPrintDocument: function () {
            const doc = new jsPDF({
                orientation: "p", //set orientation
                unit: "pt", //set unit for document
                format: "letter" //set document standard
            });

            const sizes = {
                xs: 10,
                sm: 14,
                p: 16,
                h3: 18,
                h2: 20,
                h1: 22
            };
            const fonts = {
                times: 'Times',
                helvetica: 'Helvetica'
            };
            const margin = 0.5; // inches on a 8.5 x 11 inch sheet.
            const verticalOffset = margin;
            var columns = [
                { title: "Désignation", dataKey: "col1" },
                { title: "Quantité EN BT", dataKey: "col2" },
                { title: "Quantité EN T", dataKey: "col3" },
                { title: "PU EN HT", dataKey: "col4" },
                { title: "Montant HT", dataKey: "col5" }
            ]
            var rows = [
                {
                    "col1": "Bouteille 12KG AFRIQUIA",
                    "col2": "120",
                    "col3": "1.440",
                    "col4": "65.7",
                    "col5": "94.61",
                },
                {
                    "col1": "Bouteille 12KG AFRIQUIA",
                    "col2": "130",
                    "col3": "1.560",
                    "col4": "65.7",
                    "col5": "102.49",
                },
                {
                    "col1": "Propane 34KG AFRIQUIA",
                    "col2": "60",
                    "col3": "2.040",
                    "col4": "84.23",
                    "col5": "171.83",
                },
                {
                    "col1": "Bouteille 12KG AFRIQUIA",
                    "col2": "90",
                    "col3": "0.960",
                    "col4": "65.7",
                    "col5": "63.07",
                }
            ]

            const img = new Image();
            img.src = '/media/Logo2.png';
            img.onload = () => {
                // Section 2 : TITLE OF THE INVOICE ------ START
                // Invoice Section
                doc.setFontSize(15)
                doc.setFont("Verdana", "bold");
                doc.setTextColor(0, 0, 0);
                doc.text("FACTURE", 40, 180) // x = 140 & Y = 40
                doc.setFontSize(7)
                doc.text("Numero de Facture :", 40, 180 + 20)
                doc.text("Date de Facturation :", 40, 190 + 20)
                // doc.text("Echéance :", 40, 200 + 20)
                doc.setFontSize(6)
                doc.setFont("times")
                doc.setFontType("italic")
                doc.setTextColor(128, 128, 128);
                doc.text("90000006", 40 + 80, 180 + 20)
                doc.text("3 janv.23 00:00:00", 40 + 80, 190 + 20)
                // doc.text("30/03/2023", 40 + 80, 200 + 20)
                // Vertical Line divider
                doc.line(290, 150, 290, 230, 'FD');
                // Client Section
                doc.setFontSize(15)
                doc.setFont("Verdana", "bold");
                doc.setTextColor(0, 0, 0);
                doc.text("CLIENT", 340, 180)
                doc.setFontSize(7)
                doc.text("Code Client :", 340, 180 + 20)
                doc.text("Nom du client :", 340, 180 + 30)
                doc.text("Adresse :", 340, 200 + 20)
                doc.text("ICE :", 340, 210 + 20)
                doc.setFontSize(6)
                doc.setFont("times")
                doc.setFontType("italic")
                doc.setTextColor(128, 128, 128);
                doc.text("1000001", 340 + 80, 180 + 20)
                doc.text("Client GAZ", 340 + 80, 190 + 20)
                doc.text("23 Hay fath, parking 30, 48520 Rabat", 340 + 80, 200 + 20)
                doc.text("874541231", 340 + 80, 210 + 20)
                // Section 2 : TITLE OF THE INVOICE ------ END 
                doc.autoTable(columns, rows, {
                    theme: 'plain',
                    styles: {
                        lineColor: [0, 0, 0],
                        lineWidth: 1,
                    },
                    columnStyles: {
                        col1: { fillColor: false },
                        col2: { fillColor: false },
                        col3: { fillColor: false },
                        col4: { fillColor: false },
                        col5: { fillColor: false },
                        col6: { fillColor: false },
                    },
                    margin: { top: 270 },
                    addPageContent: function (data) {
                        doc.text("", 40, 30);
                    }
                });
                var firstTable = doc.autoTable.previous.finalY;

                var columns1 = [
                    { title: "TVA %", dataKey: "col1" },
                    { title: "Base Imposable", dataKey: "col2" },
                    { title: "Montant TVA", dataKey: "col3" }
                ]

                var rows1 = [
                    {
                        "col1" : "19",
                        "col2" : "260.17",
                        "col3" : "49.43"
                    },
                    {
                        "col1" : "7",
                        "col2" : "171.83",
                        "col3" : "12.03"
                    }
                ]
                doc.autoTable(columns1, rows1, {
                    startY : firstTable + 150,
                    theme: 'plain',
                    styles: {
                        lineColor: [0, 0, 0],
                        lineWidth: 1,
                    },
                    columnStyles: {
                        col1: { fillColor: false },
                        col2: { fillColor: false },
                        col3: { fillColor: false }
                    },
                    // margin: { top: 220 },
                    addPageContent: function (data) {
                        doc.text("", 40, 30);
                    }
                });



                /* Explanation : This part below handle the section that gonna be repeated in all pages */
                const pageCount = doc.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    const pageSize = doc.internal.pageSize;
                    const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
                    const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
                    const footer = `Page ${i} sur ${pageCount}`;

                    // Header of the Document
                    this.onGetHeader(doc, img)

                    // Footer of the Document
                    this.onGetFooter(doc, footer, pageWidth, pageHeight)

                    // Last Page Displayed Text
                    // if (i == pageCount) {
                    //     doc.text("HELLO ACHRAF", 200, 200)
                    // }

                    // assuming the quantity is in the second column (col2)
                    let totalQuantity = 0;
                    for (let i = 0; i < rows.length; i++) {
                        totalQuantity += parseInt(rows[i]["col3"].split(" ")[0]); // assuming zero-based indexing for columns
                    }

                    // Add the total quantity to the PDF
                    doc.setDrawColor(0,0,0)
                    doc.setTextColor(0,0,0)
                    doc.rect(40, firstTable, 447, 20)
                    doc.rect(487, firstTable, 85, 20) // ttttt 
                    doc.rect(40, firstTable + 20, 447, 20)
                    doc.rect(487, firstTable + 20, 85, 20) // tttttt
                    doc.rect(40, firstTable + 50, 447 + 85, 35)
                    doc.text("Total HT", 255, firstTable+13)
                    doc.text("Total TTC", 253, firstTable+32)
                    doc.text("432", 519, firstTable + 12)
                    doc.text("493.12", 515, firstTable + 33)
                    doc.text("ARRETEE LA PRESENTE FACTURE A LA SOMME DE : QUATRE CENT QUATRE-VINGT-TREIZE Dirhams QUARANTE SIX Centimes", 60, firstTable + 70)

                    // doc.text(`Total quantity: ${totalQuantity}`, 10, doc.autoTable.previous.finalY + 10);


                }

                // Print the DOC to the User
                doc.save(`${name}.pdf`);
            }
        },
        onGetHeader: function (doc, img) {
            doc.setTextColor(0, 0, 0)
            doc.setFillColor(255, 0, 0)
            // rectangle x, y, width, height
            doc.rect(10, 0, 592, 3, 'F')
            // Section 1 : HEADER OF THE INVOICE ------ START 
            doc.addImage(img, 'PNG', 30 + 20, 20, 150, 100)
            /* Enterprise Name */
            doc.setFontSize(22)
            doc.setFont("times");
            doc.setFontType("bolditalic");
            doc.text("GAZAFRIC", 140 + 80, 40 + 10) // x = 140 & Y = 40
            /* Enterprise Details*/
            // Left Text items in the enterprise Details - START
            doc.setFont("times");
            doc.setFontType("bolditalic");
            doc.setFontSize(8)
            doc.text("Adresse :", 140 + 80, 60 + 10)
            doc.text("Téléphone :", 140 + 80, 75 + 10)
            doc.text("Email :", 140 + 80, 90 + 10)
            // Left Text items in the enterprise Details - END
            // RIGHT Text items in the enterprise Details - START
            doc.setFont("times")
            doc.setFontType("italic")
            doc.setFontSize(8)
            doc.setTextColor(128, 128, 128);
            doc.text("11b Rue Ahmed Akrad, 20103, Casablanca", 185 + 80, 60 + 10) // x = 140 & Y = 40
            doc.text("(+212) 05229-42130", 185 + 80, 75 + 10) // x = 140 & Y = 40
            doc.text("contact@idnaco-group.com", 185 + 80, 90 + 10)
            // RIGHT Text items in the enterprise Details - END
            /* Date */
            doc.setFontSize(6)
            doc.setFont("times")
            doc.setFontType("bold")
            doc.text("12/01/2022", 540, 28)
            // Line divider
            doc.setDrawColor((255, 0, 0));
            doc.line(30, 130, 585, 130, 'FD');
            // Section 1 : HEADER OF THE INVOICE ------ END
        },
        onGetFooter: function (doc, footer, pageWidth, pageHeight) {
            // doc.text(footer, pageWidth / 2 - (doc.getTextWidth(footer) / 2), pageHeight - 15, { baseline: 'bottom' });

            doc.setFontSize(8)
            doc.text("GAZAFRIC", 40, 780)
            // doc.text(540, 780, footer); //print number bottom right
            doc.setFillColor(255, 0, 0)
            doc.rect(10, 789, 592, 3, 'F')
        }

    });
});
