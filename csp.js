// Hypothèses :
//
// - Afin de simplifier l'implémentation initiale de l'algorithme, on utilise une seule contrainte
//   pour débuter: deux cours ne peuvent pas être donnés par le même professeur. Ça va ressembler
//   drôlement au problème de 'coloriage' des provinces d'Australie.
//
// - Pour l'instant, chaque professeur va être assigné à un seul cours. Éventuellement, il faudrait
//   généraliser le problème et permettre à un professeur d'avoir N cours, où N est un nombre qu'il
//   va choisir. En gros, le professeur aurait le droit de donner entre 1 et N cours. Cette valeur
//   sera une propriété de l'objet professeur.
//
// - Dans l'objet 'csp', l'ordre de la liste des professeurs est significative. Le professeur en
//   position 0 va avoir ses cours avant celui à la position 1. Éventuellement, on pourrait utiliser
//   un ordre qui place les directeurs en premier, suivis des coordonateurs puis des professeurs...
//
// =====================================================================================
// Section des données: Ceci est temporaire! Ces données seront éventuellement ailleurs!
// =====================================================================================
//
// Nouveau format de l'objet CSP, qui est une définition formelle du problème. L'avantage d'avoir
// toutes les définitions à l'intérieur de l'objet est qu'il sera maintenant possible d'avoir des
// fichier JSON qui vont correspondre à un 'problem set'. On aura juste à loader ces fichiers au
// lieu de devoir définir nos éléments dans le code. De plus, ça va justifier l'utilisation de
// Node.js, car on aurait pas pu ouvrir des fichiers si on restait 'front-end'! :-)
//
// Information sur les objets de cours :
// Jours - "lundi", "mardi", "mercredi", "jeudi", "vendredi"
// Périodes - "AM", "PM", "SOIR"
// Niveau - 3 : "directeur", 2 : "professeur", 1 : "chargé de cours". directeur > professeur > chargé de cours
// Est-ce qu'on devrait faire mieux? (utiliser des strings?) Je crois que des Strings vont apporter moins de confusion..
//
// =====================================================================================
//                      Contraintes actuellement implémentées
// =====================================================================================
// - Un cours peut être assigné seulement une fois.
// - Un professeur ne peut pas donner 2 cours durant la même plage horaire.
// - Un professeur qui a une mauvaise évaluation pour le cours X, ne peut pas donner le cours X.
// - Le directeur a priorité sur tout.
// - Un professeur a priorité sur un chargé de cours.
// - Un prof a priorité sur un cours s'il est le dernier à  l'avoir donné. (Il perd la prio après 4 fois consécutives, pas impémenté)
// - Un PROFESSEUR ne peut pas donner plus de 2 cours.
// - Un CHARGE_DE_COURS ne peut donner plus de 4 cours.

// Plus simple des int pour l'heuristique et pour trier le array (voir fonction search).
var DIRECTEUR = 3,
PROFESSEUR = 2,
CHARGE_DE_COURS = 1;

// TEST DE BASE
/*var csp = {
    professeurs: [
    {
        id: "prof1",
        nom: "Harish Gunnarr",
        coursDesires: ["inf1120-00", "inf3105-10", "inf4230-00", "inf5000-22", "inf2120-00"],
        niveau: CHARGE_DE_COURS,
        coursSessionDerniere: [],
        mauvaiseEvaluation : [],
        nombreCoursDesires: 2,
        nombreCoursAssignes: 0
    },
    {
        id: "prof2",
        nom: "Lucio Benjamin",
        coursDesires: ["inf2120-00", "inf3105-10", "inf2015-40"],
        niveau: PROFESSEUR,
        coursSessionDerniere: [],
        mauvaiseEvaluation : [],
        nombreCoursDesires: 2,
        nombreCoursAssignes: 0
    },
    {
        id: "prof3",
        nom: "Mickey Hyakinthos",
        coursDesires: ["inf2120-00", "inf4375-10"],
        niveau: PROFESSEUR,
        coursSessionDerniere: ["INF2120"],
        mauvaiseEvaluation : [],
        nombreCoursDesires: 1,
        nombreCoursAssignes: 0
    }
    ],
    coursDisponibles: [
    {
        id: "inf1120-00",
        sigle: "INF1120",
        jour: "lundi",
        periode: "AM"
    },
    {
        id: "inf2120-00",
        sigle: "INF2120",
        jour: "lundi",
        periode: "AM"
    },
    {
        id: "inf3105-10",
        sigle: "INF3105",
        jour: "mardi",
        periode: "AM"
    },
    {
        id: "inf5000-22",
        sigle: "INF5000",
        jour: "mercredi",
        periode: "SOIR"
    },
    {
        id: "inf4230-00",
        sigle: "INF4230",
        jour: "vendredi",
        periode: "SOIR"
    },
    {
        id: "inf4375-10",
        sigle: "INF4375",
        jour: "jeudi",
        periode: "SOIR"
    },
    {
        id: "inf2015-40",
        sigle: "INF2015",
        jour: "vendredi",
        periode: "PM"
    }
    ]
};*/

// TEST PLUS COMPLEXE, NOTAMMENT POUR TESTER LE CONCEPT DE 1ER TOUR 2E TOUR, ETC.
// TODO : coursSessionDerniere, mauvaise données, voir fonction pour détail.
var csp = {
    professeurs: [
    {
        id: "prof1",
        nom: "Harish Gunnarr",
        coursDesires: ["inf1120-00", "inf3105-10", "inf4230-00", "inf5000-22", "inf2120-00", "inm6000-20"],
        niveau: CHARGE_DE_COURS,
        coursSessionDerniere: [],
        mauvaiseEvaluation : [],
        nombreCoursDesires: 2,
        nombreCoursAssignes: 0
    },
    {
        id: "prof2",
        nom: "Lucio Benjamin",
        coursDesires: ["inf2120-00", "inf2015-40", "inf1120-00", "inm6000-20", "inf3105-10", "inf5000-22", "inf4230-00", "inf3135-20"],
        niveau: CHARGE_DE_COURS,
        coursSessionDerniere: ["INF1120"],
        mauvaiseEvaluation : [],
        nombreCoursDesires: 4,
        nombreCoursAssignes: 0
    },
    {
        id: "prof3",
        nom: "Mickey Hyakinthos",
        coursDesires: ["inf2120-00", "inf4375-10", "inf3143-40", "inm6000-20"],
        niveau: PROFESSEUR,
        coursSessionDerniere: ["INF3143"],
        mauvaiseEvaluation : [],
        nombreCoursDesires: 1,
        nombreCoursAssignes: 0
    },
    {
        id: "prof4",
        nom: "John Ferguson",
        coursDesires: ["inf2120-00", "inf4375-10", "inf5000-22", "inf3143-40", "inf6431-80"],
        niveau: PROFESSEUR,
        coursSessionDerniere: [/*"inf6431-80"*/"INF4375"],
        mauvaiseEvaluation : [],
        nombreCoursDesires: 1,
        nombreCoursAssignes: 0
    },
    {
        id: "prof5",
        nom: "Miley Cyrus",
        coursDesires: ["inf4375-10", "inf1120-00", "inf2120-00", "inf2015-40", "inf2120-00"],
        niveau: PROFESSEUR,
        coursSessionDerniere: ["INF2120", "INF2015"],
        mauvaiseEvaluation : [],
        nombreCoursDesires: 2,
        nombreCoursAssignes: 0
    }/*,
    {
        id: "prof6",
        nom: "Frank Underwood",
        coursDesires: ["inf6431-80"],
        niveau: DIRECTEUR,
        coursSessionDerniere: [],
        mauvaiseEvaluation : [],
        nombreCoursDesires: 1,
        nombreCoursAssignes: 0
    }*/
    ],
    coursDisponibles: [
    {
        id: "inf1120-00",
        sigle: "INF1120",
        jour: "lundi",
        periode: "AM"
    },
    {
        id: "inf2120-00",
        sigle: "INF2120",
        jour: "lundi",
        periode: "AM"
    },
    {
        id: "inf3105-10",
        sigle: "INF3105",
        jour: "mardi",
        periode: "AM"
    },
    {
        id: "inm6000-20",
        sigle: "INM6000",
        jour: "mardi",
        periode: "PM"
    },
    {
        id: "inf3135-20",
        sigle: "INF3135",
        jour: "mercredi",
        periode: "AM"
    },
    {
        id: "inf5000-22",
        sigle: "INF5000",
        jour: "mercredi",
        periode: "SOIR"
    },
    {
        id: "inf4230-00",
        sigle: "INF4230",
        jour: "vendredi",
        periode: "SOIR"
    },
    {
        id: "inf4375-10",
        sigle: "INF4375",
        jour: "jeudi",
        periode: "SOIR"
    },
    {
        id: "inf2015-40",
        sigle: "INF2015",
        jour: "vendredi",
        periode: "PM"
    },
    {
        id: "inf3143-40",
        sigle: "INF3143",
        jour: "mardi",
        periode: "SOIR"
    },
    {
        id: "inf6431-80",
        sigle: "INF6431",
        jour: "lundi",
        periode: "AM"
    }
    ]
};
// RESULTS
/*{ prof3: [ 'inf3143-40' ],
prof4: [ 'inf4375-10' ],
prof5: [ 'inf2120-00', 'inf2015-40' ],
prof1: [ 'inf3105-10', 'inf4230-00' ],
prof2: [ 'inf1120-00', 'inm6000-20', 'inf5000-22', 'inf3135-20' ] }*/

// =================================================
// Section des algorithmes: Cette section va rester!
// =================================================
//
// Implémentation de 'Backtracking Search' récursif
// TODO:
//   - Ajouter les heuristiques
//   - Ajouter le arc-consistency (fonction 'inference')
//   - Transformer ça en algo itératif (si c'est trop lent!)
//
// Structure d'un objet 'assignment' (résolution en cours du problème):
// var assignment = {
//    prof1: [], // Ceci est une liste parce qu'éventuellement, on va assigner plus d'un cours par prof si désiré!
//    prof2: [],
//    prof3: []
//};
function search(csp) {
    var assignment, // TODO : Dans ce assignment on poura mettre les choix du directeur, au besoin et le merger avec les 2 autres.
        assignment_prof,
        assignment_charge;
    var professeurs = csp["professeurs"];

    if(validerMaxCours(professeurs)) {
        assignment_prof = initialiserAssignment(professeurs, PROFESSEUR);
        assignment_charge = initialiserAssignment(professeurs, CHARGE_DE_COURS);

        // On trie le tableau de professeurs dans l'objet csp selon le niveau en ordre décroissant.
        // directeur > professeur > chargé de cours
        professeurs.sort(function(a, b) {return b['niveau']-a['niveau']}); // TODO : Utiliser efficacement ce tri. Note à moi-même (P-O)

    } else
        throw 'Un professeur peut donné un maximum de 2 cours et un chargé de cours un maximum de 4 cours.';

    //assignerDirecteur(csp, assignment);

    backtrackingSearch(csp, assignment_prof, PROFESSEUR);
    backtrackingSearch(csp, assignment_charge, CHARGE_DE_COURS);
    /*var res = mergeAssignment(assignment_prof, assignment_charge);

    return mergeAssignment(res, assignment);*/
    return mergeAssignment(assignment_prof, assignment_charge);
}

function backtrackingSearch(csp, assignment, niveau) {
    if (isComplete(assignment)) return assignment;

    var professeur = selectNextUnassignedVariable(csp, niveau);
    var domaineProfesseur = orderDomainValues(professeur, assignment, csp);
    var result;

    for (var i = 0; i < domaineProfesseur.length; i++) {
        var cours = getCoursById(csp, domaineProfesseur[i]);
        var assignmentCopy = JSON.parse(JSON.stringify(assignment));

        addAssignment(professeur, cours["id"], assignment);

        if (isConsistent(cours, professeur, assignmentCopy)) {
			//Ajout de AC3 : semble fonctionnel
			//Des tests plus approfondies vont etre necessaire.
			//Creation d'une copie du csp, on l'envoi dans AC3
			//Puis on passe la copy a la recursivite
			//var cspCopy = JSON.parse(JSON.stringify(csp));
			//var cspAC3 = AC3(cspCopy);
            var result = backtrackingSearch(csp, assignment, niveau);
            if (result) break;
        }

        removeAssignment(professeur, cours, assignment);
    }

    return result;
}

// =================================================
//      Section des fonctions utilitaires
// =================================================

// Cette fonction retourne la liste des cours assignables à un professeur. C'est ici qu'on devra ajouter
// les heuristiques. C'est d'ailleurs pour ça qu'on passe en argument 'assignment'... En ayant 'assignment',
// on va pouvoir éliminer des valeurs possibles du domaine. Pour l'instant, on retourne juste la liste de
// cours désirés par le professeurs.
function orderDomainValues(professeur, assignment, csp) {
    return prioriteCoursDerniereSession(professeur, csp);
    //return professeur["coursDesires"];
}

// Retourne si un professeur a une assignation complète.
function isAssigned(professeur) {
    return professeur["nombreCoursAssignes"] === professeur["nombreCoursDesires"];
}

// Un 'assignment' est complet si chacun des professeurs a un cours assigné. Ceci est construit de façon à
// pouvoir permettre un nombre illimité de professeurs.
function isComplete(assignment) {
    var professeurs = csp["professeurs"];

    for (var prof in assignment) {
        var professeur = getProfesseurById(csp, prof);
        if (!isAssigned(professeur)) return false;
    }
    return true;
};

// Va retourner la prochaine variable (professeur) qui n'est pas complètement assignée.
// TODO : éventuellement il faudrait sélectionner les profs par ancienneté.
// TODO : La sélection du directeur devrait se faire avant le début de l'algo et on devrait retirer
//        les choix du directeur du dommaine de tous les profs.
function selectNextUnassignedVariable(csp, niveau) {
    var professeurs = csp["professeurs"];
    var profAAssigner = undefined;
    var tour = Infinity;

    for (var i = 0; i < professeurs.length; i++) {
        var professeur = professeurs[i];
        if(professeur['niveau'] === niveau && !isAssigned(professeur)) {
            if(professeur['nombreCoursAssignes'] < tour) {
                profAAssigner = professeur;
                tour = professeur['nombreCoursAssignes'];
            }
        }
    }
    //console.log(profAAssigner)
    return profAAssigner;
}

// Ces fonctions servent à assigner/désassigner un cours à un professeur. Éventuellement, il faudrait vérifier si
// le professeur et le cours existent sinon on garoche une exception!
function addAssignment(professeur, cours, assignment) {
    professeur["nombreCoursAssignes"]++;
    assignment[professeur.id].push(cours);
}

function removeAssignment(professeur, cours, assignment) {
    professeur["nombreCoursAssignes"]--;
    var professeur = assignment[professeur.id];
    professeur.splice(professeur.indexOf(cours), 1);
}

// Recherche d'un professeur par son 'id'
function getProfesseurById(csp, id) {
    var professeurs = csp["professeurs"];

    for (var i = 0; i < professeurs.length; i++) {
        if (professeurs[i].id === id) return professeurs[i];
    }

    throw "Le professeur ayant l'identifiant " + id + " n'existe pas!";
}

// Recherche d'un cours par son 'id'
function getCoursById(csp, id) {
    var cours = csp["coursDisponibles"];

    for (var i = 0; i < cours.length; i++) {
        if (cours[i].id === id) return cours[i];
    }

    throw "Le cours ayant l'identifiant " + id + " n'existe pas!";
}

// C'est ici qu'on va mettre toutes nos contraintes! Pour commencer, on va juste s'assurer que deux professeurs
// différents ne donnent pas le même cours. Éventuellement, on pourrait mettre chacunes des contraintes dans sa
// propre fonction!
function isConsistent(cours, professeur, assignment) {
    if (coursDejaAssigne(cours, assignment)) return false;
    if (mauvaiseEvaluation(cours, professeur, assignment)) return false;
    if (plageDejaAssignee(cours, professeur, assignment)) return false;

    // Autres checks de contraintes...

    return true;
}

// Retourne le plus grand nombre de cours désirés pour les PROFESSEURS ou CHARGE_DE_COURS.
// TODO : **POSSIBLEMENT USELESS**
function trouverMaxCoursDesires(professeurs, niveau) {
    var max = -Infinity;

    for (var i = 0; i < professeurs.length; i++) {
        if(professeurs[i]['niveau'] === niveau && professeurs[i]['nombreCoursDesires'] > max)
            max = professeurs[i]['nombreCoursDesires'];
    }
    return max;
};

// Initialise assignment
function initialiserAssignment(professeurs, niveau) {
    var assignment = {};

    for (var i = 0; i < professeurs.length; i++) {
        if(professeurs[i]['niveau'] === niveau) {
            var professeur = professeurs[i]['id'];
            assignment[professeur] = [];
        }
    }
    return assignment;
};

function mergeAssignment(assign1,assign2) {
    var assignment = {};
    for (var prof in assign1) assignment[prof] = assign1[prof];
    for (var prof in assign2) assignment[prof] = assign2[prof];
    return assignment;
};


// =================================================
//      Section fonctions AC3
// =================================================

//Passe une copie de csp
function AC3 (csp){
	var queue = remplirQueue(csp);

	while(queue.length != 0){
		var arcATraiter = queue.pop();
		// On verifie si il y a des valeurs inconsistentes
		if (removeValeurInconsistentes (csp, arcATraiter)){
			if(arcATraiter.length == 0)
			{
				return undefined;
			}
		// Si oui, alors on ajoute la paire inverse a la queue
			for(i = 0 ; i < arcATraiter.length ; i++){
				var queueArc = new Array();
				queueArc.push(arcATraiter[1]);
				queueArc.push(arcATraiter[0]);
				queue.push(queueArc);
			}

		}
	}
	return csp;
}

//Fonction qui supprime le cours identique dans xi
//si le domaine de xi est plus grand que le domaine de xj
//Cependant, je ne suis pas sur si c'est assez, c'est ce que moi
//et richard ont compris.
function removeValeurInconsistentes (csp, arcATraiter){
	var removed = false;

	var arcXi = getProfesseurById(csp, arcATraiter[0]);
	var arcXj = getProfesseurById(csp, arcATraiter[1]);

	//Domaine xi (Cours de arcXi)
	for(i = 0 ; i < arcXi["coursDesires"].length; i++){
		//Domaine xj (Cours de arcXj)
		for(j = 0 ; j < arcXj["coursDesires"].length; j++){
			//Le domaine de xi est plus grand que xj
			if(arcXi["coursDesires"].length > arcXj["coursDesires"].length)
			{
				//Verifier si un cours de xi se retrouve dans xj
				//Si oui, alors on l'enleve de xi.
				if(arcXi["coursDesires"][i] == arcXj["coursDesires"][j])
				{
					arcXi["coursDesires"].splice(i,1);
					removed = true;
				}
			}
		}
	}
	return removed;
}


//Fonction qui cree des pairs d'arcs avec les id des profs.
//Retourne une queue remplis des arcs
// donne : [ 'prof1', 'prof2' ]
function remplirQueue (csp){
	var queue = new Array();
	var professeurs = csp["professeurs"];
	for ( i = 0 ; i < professeurs.length; i++)
	{
		for( j = 0 ; j < professeurs.length; j++){
			//Creation d'un array temporaire pour "holder" les pairs
			var queueArc = new Array();
			if(professeurs[i].id != professeurs[j].id)
			{
				queueArc.push(professeurs[i].id)
				queueArc.push(professeurs[j].id);
				// On push alors les pair dans l'array que l'on retourne a la fin
				queue.push(queueArc);
			}
		}
	}
	return queue;
}


// =================================================
//      Section des fonctions d'heuristiques
// =================================================

// Ajuster le domaine d'un professeur si un de ses choix est un cours qui a été
// donné par un autre prof à la dernière session car ce dernier a priorité sur ce cours.
// TODO : Laid, mais fonctionnel.
function prioriteCoursDerniereSession(professeur, csp) {
    var professeurs = csp['professeurs'];
    var coursDesires = professeur['coursDesires'];

    for (var i = 0; i < professeurs.length; i++) {
        if(professeurs[i]['id'] !== professeur['id']) {
            var courant = professeurs[i];

            if(courant['coursSessionDerniere'].length !== 0) {
                var coursSessionDerniere = courant['coursSessionDerniere'];

                for(var j = 0; j < coursSessionDerniere.length; j++) {
                    var sigle = coursSessionDerniere[j].toLowerCase();

                    for(var k = 0; k < coursDesires.length; k++) {
                        var res = coursDesires[k].substr(0,7);

                        if(sigle === res) {
                            var index = coursDesires.indexOf(coursDesires[k]);
                            coursDesires.splice(index, 1);
                        }
                    }
                }
            }
        }
    }
    //console.log(coursDesires);
    return coursDesires;
};

function assignerDirecteur(){

};

// =================================================
//      Section des fonctions de contraintes
// =================================================

// Est-ce que le cours est déjà assigné?
function coursDejaAssigne(cours, assignment) {
    for (var property in assignment) {
        if (assignment.hasOwnProperty(property)) {
            if (assignment[property].indexOf(cours.id) != -1) return true;
        }
    }

    return false;
}

// Est-ce que l'horaire du professeur permet l'ajout du cours?
// Ceci ne sera utilisé que quand il sera possible d'avoir plus qu'un cours par professeur...
function plageDejaAssignee(cours, professeur, assignment) {
    var coursDonnes = assignment[professeur.id];

    for (var i = 0; i < coursDonnes.length; i++) {
        var coursDonne = getCoursById(csp, coursDonnes[i]);
        if (coursDonne["jour"] == cours["jour"] && coursDonne["periode"] == cours["periode"]) return true;
    }

    return false;
}

// On prend le professeur qui vien de recevoir un cours assigner, puis on verifie
// que le cours n'est pas dans sa liste de cours ayant une mauvaise evaluation
function mauvaiseEvaluation(cours, professeur, assignment) {
    for (i = 0; i < professeur["mauvaiseEvaluation"].length; i++) {
        if (cours["id"] == professeur["mauvaiseEvaluation"][i]) return true;
    }

    return false;
}

// - Un PROFESSEUR ne peut pas donner plus de 2 cours.
// - Un CHARGE_DE_COURS ne peut donner plus de 4 cours.
// Cette fonction existe seulement pour qu'on ne fasse pas d'erreur quand on crée des données manuellement
// et agit comme une contrainte.
function validerMaxCours(professeurs) {
    var MAX_PROFESSEUR = 2,
        MAX_CHARGE_DE_COURS = 4;

    for(var i = 0; i < professeurs.length; i++) {
        var courant = professeurs[i];

        if(courant['niveau'] === PROFESSEUR) {
            if(courant['nombreCoursDesires'] > MAX_PROFESSEUR) return false;

        } else if (courant['niveau'] === CHARGE_DE_COURS) {
            if(courant['nombreCoursDesires'] > MAX_CHARGE_DE_COURS) return false;
        }
    }
    return true;
};


// TODO: Une shitload de contraintes!


// Tests!
debugger;
var test = search(csp);
console.log(test);

exports.search = function (cspSend){
    return search(cspSend);
}
