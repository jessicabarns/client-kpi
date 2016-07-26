/**
 * @description le tableau des couleurs sous le format suivant:
 *      [valeur de la couleur dans le dropdown][valeur css de la couleur]
 * @type {Array}
 */
var COLORS = [];

(function () {
    var ctx = {};
    ctx.Templates = {};
    ctx.Templates.Fields = {
        'umakpi': {
            'NewForm': dropdownColors,
            'EditForm': dropdownColors,
            'DisplayForm': showValue,
            'View': showValue
        }
    };
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(ctx);
})();

/**
 * @description créer le dropdown des couleurs
 * @param ctx le contexte
 * @return {string} l'élément html dans lequel on insérera le dropdown
 */
function dropdownColors(ctx) {
    var fieldSchema = ctx.CurrentFieldSchema;
    //console.log(ctx);
    var fieldValue = ctx.CurrentItem[ctx.CurrentFieldSchema.Name];
    var fieldName = ctx.CurrentFieldSchema.Name;
    //console.log(fieldName);
    init(function () {
        var divColors = $("div#colors");
        if (divColors.children().length === 0) {
            var dropdown = showChoices(fieldSchema, fieldValue, true, false);
            divColors.append(dropdown);
            onClick(ctx, fieldName);
        }
    });
    return "<div id='colors'></div>";
}

/**
 * @description setter l'événement onClick des couleurs
 * @param ctx le contexte
 * @param fieldName le nom du champ
 */
function onClick(ctx, fieldName) {
    var divColors = $("div.colors");
    divColors.not("div.selected").addClass("hide");
    divColors.click(function () {
        var divHide = $("div.hide");
        if (divHide.length !== 0)
            divHide.removeClass("hide");
        else {
            $("div.selected").removeClass("selected");
            $(this).addClass("selected");
            $("div.colors").not("div.selected").addClass("hide");
            changeValue(ctx, fieldName);
        }
    });
}


/**
 * @description variable utilitaire à la fonction showValue qui est un compteur
 * @type {number}
 */
var count = 0;
/**
 * @description afficher la couleur choisie pour les view qui ne permettent pas d'éditer
 * @param ctx le contexte
 * @return {string} l'élément html dans lequel on insérera la couleur
 */
function showValue(ctx) {
    //console.log(ctx);
    var fieldSchema = ctx.CurrentFieldSchema;
    var fieldValue = ctx.CurrentItem[ctx.CurrentFieldSchema.Name];
    var isListView = (ctx.ListData.LastRow > 1);
    var style = (isListView ? "text-align: center;" : "");

    var id = "colors";
    id += (isListView ? count : "");
    if (isListView) count++;

    init(function () {
        var divId = $("div#" + id);
        if (divId.children().length === 0) {
            var dropdown = showChoices(fieldSchema, fieldValue, false, true);
            divId.append(dropdown);
        }
    });

    return "<div id='" + id + "' style='" + style + "'></div>";
}

/**
 * @description changer la valeur du champ kpi
 * @param ctx le contexte
 * @param fieldName le nom du champ kpi
 */
function changeValue(ctx, fieldName) {
    var formCtx = SPClientTemplates.Utility.GetFormContextForCurrentField(ctx);
    formCtx.registerGetValueCallback(fieldName, function () {
        return $("div.selected").attr("title");
    });
}

/**
 * @description afficher le dropdown
 * @param fieldSchema le schema du champ kpi
 * @param fieldValue la valeur du champ kpi
 * @param all true pour montrer tous les choix, false pour montrer uniquement fieldValue
 * @param readOnly true si readOnly, false sinon
 */
function showChoices(fieldSchema, fieldValue, all, readOnly) {
    var renderFields = "",
        title,
        style,
        classes,
        i = (all ? 0 : fieldSchema.Choices.indexOf(fieldValue)),
        size = (all ? fieldSchema.Choices.length : i + 1);

    for (i; i < size; i++) {
        title = fieldSchema.Choices[i];
        style = "background-color: " + COLORS[title] + ";";

        classes = "colors";
        if (readOnly) classes += " readOnly";
        else if (title === fieldValue) classes += " selected";

        renderFields += "<div title='" + title + "' " +
            "style='" + style + "' " +
            "class='" + classes + "'></div>";
    }
    return renderFields;
}

/**
 * @description loader et initialiser les fichiers et variables nécessaires
 * @param callback le callback
 */
function init(callback) {
    loadCss("https://umaknow.sharepoint.com/teams/appdevjess/Code/css/kpi.css");
    loadJavaScript("https://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.12.4.min.js", function () {
        initVars("https://umaknow.sharepoint.com/teams/appdevjess/Code/utility/config.xml").promise().done(callback);
    });
}

/**
 * @description loader les variables du fichier de config
 * @param url l'url du fichier de config
 * @return {*} la requête ajax
 */
function initVars(url) {
    return $.ajax({
        url: url,
        type: "GET",
        dataType: "xml",
        success: function (xml) {
            $(xml).find("colors").children().each(function () {
                COLORS[(this).nodeName] = (this).firstChild.data;
            });
        },
        error: function (error) {
            console.log(error);
        }
    });
}

/**
 * @description loader un fichier javascript
 * @param url l'url du fichier
 * @param callback le callback
 */
function loadJavaScript(url, callback) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onreadystatechange = callback;
    script.onload = callback;
    head.appendChild(script);
}

/**
 * @description loader un fichier css
 * @param url l'url du fichier
 */
function loadCss(url) {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    head.appendChild(link);
}


