define(["postmonger"], function(Postmonger) {
    "use strict";

    var connection = new Postmonger.Session();
    var payload = {};
    var lastStepEnabled = false;
    var steps = [
        // initialize to the same value as what's set in config.json for consistency
        { "label": "Message Content", "key": "step1" },
        { "label": "Insert Banner", "key": "step2" },
        { "label": "Preview & Send", "key": "step3" },
        { label: "Completed!", key: "step4", active: false },
    ];
    var currentStep = steps[0].key;

    //Startup Sequence
    $(window).ready(onRender);

    connection.on("initActivity", initialize);
    connection.on("requestedTokens", onGetTokens);
    connection.on("requestedEndpoints", onGetEndpoints);

    connection.on("clickedNext", onClickedNext);
    connection.on("clickedBack", onClickedBack);
    connection.on("gotoStep", onGotoStep);

    function onRender() {
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger("ready");

        connection.trigger("requestTokens");
        connection.trigger("requestEndpoints");

        var message = getMessage();
        $("#message").html(message);
    }

    function cvt(s) {
        let r = '';
        if (s) {
            r = s.split("\n").join('<br/>');
        }
        return r;
    }

    function initialize(data) {
        // document.getElementById("configuration").value = JSON.stringify(
        //   data,
        //   null,
        //   2
        // );

        console.log("-------- triggered:onInitActivity({obj}) --------");
        if (data) {
            payload = data;
        }

        var message;
        var hasInArguments = Boolean(
            payload["arguments"] &&
            payload["arguments"].execute &&
            payload["arguments"].execute.inArguments &&
            payload["arguments"].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ?
            payload["arguments"].execute.inArguments : {};

        $.each(inArguments, function(index, inArgument) {
            $.each(inArgument, function(key, val) {
                if (key === "message") {
                    message = val;
                }
            });
        });

        // If there is no message selected, disable the next button
        if (!message) {
            showStep(null, 1);
            connection.trigger("updateButton", { button: "next", enabled: true });
            //connection.trigger("updateButton", { button: "next", enabled: false });
            // If there is a message, skip to the summary step
        } else {
            document.getElementById("configuration").value = message;
            $("#message").html(message);
            //showStep(null, 3);
        }
    }

    const showContent = () => {
        const msg = $("#configuration").val();
        if (msg != '') {
            const now = new Date(Date.now());
            let current_time = now.getHours() + ":" + now.getMinutes();
            $('#txt-cnt .message__time').html(current_time);
            const url = $("#banner").val();
            $("#txt-cnt .message__text").html(cvt(msg));
            $("#prv").html(cvt(msg));
            if ($("#prv").is(":hidden")) {
                $("#prv").slideDown('slow', () => {
                    $("#prv").removeClass('hidden');
                })
                $("#configuration").animate({
                    opacity: 0.6,
                    height: 100
                }, 500, () => {})
            }
            $("#preview-frame").removeClass('hidden');
            if (url != '') {
                $("#image").attr('src', url);
                $("#prv-img").attr('src', url);
            } else {
                $("#image").attr('src', '');
                $("#prv-img").attr('src', '');
            }
            if ($("#image").is(':hidden')) {
                $("#image").slideDown('slow', () => {
                    $("#image").removeClass('hidden');
                });
            }
        } else {
            if ($("#image").is(':visible')) {
                $("#image").slideUp('fast', () => {
                    $("#image").addClass('hidden');
                });
            }
            $("#preview-frame").addClass('hidden');
            if ($("#prv").is(":visible")) {
                $("#prv").slideUp('fast', () => {
                    $("#prv").html('');
                    $("#prv").addClass('hidden');
                })
                $("#configuration").animate({
                    opacity: 1,
                    height: 200
                }, 500, () => {})
            } else {
                $("#prv").html('');
            }
            $("#txt-cnt .message__text").html('');
            $("#prv-img").attr('src', '');
            $("#image").attr('src', '');
        }
    }

    $("#configuration").on('blur', (e) => {
        showContent();
    })


    $("#banner").on('blur', (e) => {
        showContent();
    })


    function onGetTokens(tokens) {
        // Response: tokens = { token: <legacy token>, fuel2token: <fuel api token> }
        // console.log(tokens);
    }

    function onGetEndpoints(endpoints) {
        // Response: endpoints = { restHost: <url> } i.e. "rest.s1.qa1.exacttarget.com"
        // console.log(endpoints);
    }

    //Save Sequence
    function onClickedNext() {
        // var configuration = JSON.parse(
        //   document.getElementById("configuration").value
        // );
        //var configuration = document.getElementById("configuration").value;

        //connection.trigger("updateActivity", configuration);
        //save(configuration);

        if (
            (currentStep.key === "step3" && steps[3].active === false) ||
            currentStep.key === "step4"
        ) {
            save();
        } else {
            connection.trigger("nextStep");
        }
    }

    function onClickedBack() {
        connection.trigger("prevStep");
    }

    function onGotoStep(step) {
        showStep(step);
        connection.trigger("ready");
    }

    function showStep(step, stepIndex) {
        if (stepIndex && !step) {
            step = steps[stepIndex - 1];
        }

        currentStep = step;

        $(".step").hide();

        switch (currentStep.key) {
            case "step1":
                $("#step1").show();
                connection.trigger("updateButton", {
                    button: "next",
                    enabled: true, //Boolean(getMessage()),
                });
                connection.trigger("updateButton", {
                    button: "back",
                    visible: false,
                });
                break;
            case "step2":
                $("#step2").show();
                connection.trigger("updateButton", {
                    button: "back",
                    visible: true,
                });
                connection.trigger("updateButton", {
                    button: "next",
                    text: "next",
                    visible: true,
                });
                break;
            case "step3":
                $("#step3").show();
                connection.trigger("updateButton", {
                    button: "back",
                    visible: true,
                });
                if (lastStepEnabled) {
                    connection.trigger("updateButton", {
                        button: "next",
                        text: "next",
                        visible: true,
                    });
                } else {
                    connection.trigger("updateButton", {
                        button: "next",
                        text: "save",
                        visible: true,
                    });
                }
                break;
            case "step4":
                $("#step4").show();
                break;
        }
    }

    function save() {
        var value = getMessage();
        var photo = getBanner();

        // 'payload' is initialized on 'initActivity' above.
        // Journey Builder sends an initial payload with defaults
        // set by this activity's config.json file.  Any property
        // may be overridden as desired.
        payload.name = "Telegram Message Ready!"; //text message to send to telegram

        payload["arguments"].execute.inArguments = [{ message: value }];
        //payload["arguments"].execute.inArguments.push({"text": value})

        payload["arguments"].execute.inArguments = [{
                'telegramID': '{{Contact.Attribute.TelegramId}}'
            },
            {
                emailAddress: '{{InteractionDefaults.Email}}'
            },
            {
                customMessage: value
            },
            {
                bannerPhoto: photo
            },
            {
                customerName: "{{Interaction.FullName}}"
            },
            {
                registeredDate: "{{Interaction.registeredDate}}"
            },
            {
                activationCode: "{{Interaction.Code}}"
            }
        ];

        //payload["arguments"].execute.inArguments = [{ "chat_id": "@vcbsalesforce", "text": value }];

        payload["metaData"].isConfigured = true;


        //console.log("LOG AGAIN" + payload);
        let inArguments = payload.arguments.execute.inArguments;

        // get the option that the user selected and save it to
        console.log("------------ triggering:updateActivity({obj}) ----------------");
        console.log("Sending message back to updateActivity");
        console.log("saving\n", value);

        console.log("$ Test is OK -----------------------------------------");
        console.log(inArguments)

        connection.trigger("updateActivity", payload);

        // console.log(inArguments.length);
        // console.log(inArguments[0]['telegramID']);
        // console.log(inArguments[1]['emailAddress']);
        // console.log(inArguments[2]['customMessage']);
        // console.log(inArguments[3]['bannerPhoto']);
    }

    function getMessage() {
        return document.getElementById("configuration").value;
    }

    function getBanner() {
        return document.getElementById("banner").value;
    }

    $("#submit-this").click(function(e) {
        save();
    });
});