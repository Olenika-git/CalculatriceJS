var NDIGITS = 16;
var STACKSIZE = 12;
var decimal = 0;
var fixe = 0;
var value = 0;
var level = 0;
var entered = true;
var exponent = false;

// Creation d'un Stack, dans laquelle les Items individuels sont enregistrés(dans la pile)
function stackItem()
{
 this.value = 0;
 this.op = "";
}

// Cette fonction constructeur sert de modèle pour la pile.
function array(longueur)
{
  this[0] = 0;
  for (i = 0; i < longueur; i++)
  {
    this[i] = 0;
    this[i] = new stackItem();
  }
  this.longueur = longueur;
}
stack = new array(STACKSIZE);

// Ajout de nouveaux éléments à la pile
function pousser(value, op, prec)
{
  if (level == STACKSIZE)
  {
    return false;
  }

  for (i=level; i>0; i--)
  {
    stack[i].value = stack[i-1].value;
    stack[i].op = stack[i-1].op;
    stack[i].prec = stack[i-1].prec;
  }
  stack[0].value = value;
  stack[0].op = op;
  stack[0].prec = prec;
  level++;
  return true;
}

// Lis le dernier élément de la pile
function entrer()
{
  if (level==0)
  {
    return false;
  }
  for (i=0;i<level; ++i)
  {
    stack[i].value = stack[i+1].value;
    stack[i].op = stack[i+1].op;
    stack[i].prec = stack[i+1].prec;
  }
  --level;
  return true;
}

// Mise en forme de la valeur à afficher
function format(value)
{
  // valStr contient la valeur actuelle de value apres avoir subit au préalable une conversion en string.
  var valStr = "" + value;

  // Si value contient la valeur "Not a Number"
  // (cad si value n'est pas un nombre valide), l'affichage ne peut être formaté donc on affiche une erreur
  if (valStr.indexOf("N") >= 0 || (value == 2*value && value == 1+value))
  {
    return "Error ";
  }

  // Lors de la conversion de value en chaîne de caractères, l'objet Number sépare
  // les valeurs normales des puissances de 10 par un "e" dans l'affichage.
  var i = valStr.indexOf("e")
  if (i >= 0)
  {
  //Si dans valStr un "e" a été trouvé,la partie derrière "e" est enregistré dans expStr et supprimé de valStr
  var expStr = valStr.substring(i+1,valStr.length);
  if (i > NDIGITS -5) i = NDIGITS -5;
  valStr = valStr.substring(0, i);
  if (valStr.indexOf(".") < 0) valStr += ".";
  // L'exposant est à nouveau ajouté derrière la valeur séparé par un espace.
  valStr += " " + expStr;
  } else 
  {
  // value ne contient pas de "e" donc pas d'exposant
    var valNeg = false;
    if (value < 0) 
    { 
      value = -value; valNeg = true; 
    }
  // Le logarithme, indique le nombre de position de value.
  var expval = Math.log(value)*Math.LOG10E;
  if (value == 0) {
      expval = 0;
  // Si value ne tient plus dans l'affichage, la partie arrière est coupée et remplacée par une puissance de 10
  } else if (expval > NDIGITS-5) {
      expval = Math.floor(expval);
      value /= Math.pow(10, expval);
  } else if (-expval > NDIGITS-5) {
      expval = Math.ceil(expval);
      value /= Math.pow(10, expval);
  } else {
      expval = 0;
  }
  var valInt = Math.floor(value);
  var valFrac = value - valInt;
  var prec = NDIGITS - (""+valInt).length - 1;
  if (prec < 0)
  {
    return "Error";
  }
  if (!entered && fixe > 0)
  {
    prec = fixe;
  }

  var mult = " 1000000000000000000".substring(1,prec+2);
  var frac = Math.floor(valFrac * mult + 0.5);
  valInt = Math.floor(Math.floor(value * mult + .5) / mult);

  if (valNeg)
  {
    valStr = "-" + valInt;
  }
  else
  {
    valStr = "" + valInt;
  }

  var fracStr = "00000000000000"+frac;
  fracStr =
   fracStr.substring(fracStr.length-prec, fracStr.length);
  i = fracStr.length-1;

  if (entered || fixe==0)
  {
      while (i >=0 && fracStr.charAt(i)=="0")
       --i;
      fracStr = fracStr.substring(0,i+1);
  }

  if (i >= 0)
  {
    valStr += "." + fracStr;
  }

  if (expval != 0) 
  {
      var expStr = "" + expval;
      valStr += " " + expStr;
  }
  }
  return valStr;
}


//Fonction pour écrire la valeur actuelle dans l'affichage
function refresh()
{
  var display = format(value);

  // Si Exposant : Todo ajout des fonctions scientifique à la calc
  if (exponent)
  {
  if (expval<0)
       display += " " + expval;
  else
       display += " +" + expval;
  }

  // Si la valeur actuelle n'a pas de décimale et si aucune erreur on ajoute un "."
  if (display.indexOf(".") < 0 && display != "Error ")
  {
  if (entered || decimal > 0)
      display += '.';
  else
      display += ' ';
  }
  // La partie gauche de l'affichage est remplie avec des espaces pour afficher le texte à droite si peu de chiffre à l'écran
  display = "             " + display;
  display = display.substring(display.length-NDIGITS-1,display.length);

  // ont écris la valeur dans l'affichage
  document.calc.result.value = display;
}


// Fonction clearDisp efface la valeur affichée à l'écran
function clearDisp()
{
  exponent = false;
  value = 0;
  enter();
  refresh();
}

// Fonction clearAll qui efface les parentheses
function clearAll()
{
  level = 0;
  clearDisp();
}


// Fonction Realisation des calculs 
function evalx()
{
  if (level==0)
  return false;
  op = stack[0].op;
  sval = stack[0].value;

  if (op == "+")
  value = sval + value;
  else if (op == '-')
  value = sval - value;
  else if (op == '*')
  value = sval * value;
  else if (op == '/')
  value = sval / value;
  else if (op == 'pow')
  value = Math.pow(sval,value);
  entrer();
  if (op == '(')
  return false;
  return true;
}

// Fonction enter est appelé quand l'utilisateur appuie sur une touche de calcul ("+" - "-" - "*")
function operator(op)
{
  enter();
  if (op=='+' || op=='-')
  {
    prec = 1;
  }
  else if (op=='*' || op=='/')
  {
    prec = 2;
  }

  if (level>0 && prec <= stack[0].prec)
    {
      evalx();
    }

  if (!pousser(value,op,prec))
  {
    value = "NAN";
  refresh();
  }
}

// Lorsque l'utilisateur a terminé la saisie d'un nombre, quelques variables sont à modifier pour l'affichage
function enter()
{
  if (exponent)
  value = value * Math.exp(expval * Math.LN10);
  entered = true;
  exponent = false;
  decimal = 0;
  fixe = 0;
}

// Fonction digit est appelé, si l'utilisateur appuie sur un chiffre
function digit(n)
{
  if (entered)
  {
  value = 0;
  digits = 0;
  entered = false;
  }
  if (n == 0 && digits == 0)
  {
  refresh();
  return;
  }
  if (exponent)
  {
  if (expval < 0)
       n = -n;
  if (digits < 3)
  {
      expval = expval * 10 + n;
      ++digits;
      refresh();
  }
  return;
  }
  if (value < 0)
  n = -n;
  if (digits < NDIGITS-1)
  {
  ++digits;
  if (decimal > 0)
   {
   decimal = decimal * 10;
   value = value + (n / decimal);
   ++fixe;
   }
   else
   value = value * 10 + n;
  }
  refresh();
}

// Fonction equals Si l'utilisateur appuie sur la touche "=" le calcul est effectué et la valeur est affichée
function equals()
{
  enter();
  while (level > 0)
  {
    evalx();
    refresh();
  }
}

// Fonction sign La touche +/- inverse la valeur positif ou négatif
function sign()
{
  if (exponent)
  {
    expval = -expval;
  }

  else
  {
  value = -value;
  refresh();
  }
}

// Fonction period est appelé, si l'utilisateur souhaite spécifier une valeur décimale.
function period()
{
  if (entered)
  {
    value = 0;
    digits = 1;
  }

  entered = false;

  if (decimal == 0)
  {
    decimal = 1;
    refresh();
  }
}
// Fonction bksp l'utilisateur appuie sur la touche  " <- " la dernière saisie doit être effacée.
function bksp()
{
  if (entered)
  {
    refresh();
    return;
  }
  if (digits==0)
  {
    refresh();
    return;
  }
  if (exponent)
  {
    if (expval<0)
    {
      expval = -Math.floor(-expval/10);
    }

    else
    {
      expval = Math.floor(expval/10);
    }

    --digits;
    refresh();
    return;
  }
  if (decimal > 1)
  {
    if (value < 0)
    {
      value = -Math.floor(-value * decimal / 10);
    }
      
    else
    {
      value = Math.floor(value * decimal / 10);
      decimal = decimal / 10;
      value = value / decimal;
      --fixe;
    }
      
    if (decimal == 1)
    {
      decimal = 0;
    }
  }

  else
  {
    if (value < 0)
    {
      value = -Math.floor(-value / 10);
    }
      
    else
    {
      value = Math.floor(value / 10);
      decimal = 0;
    }
      
  }
  --digits;
  refresh();
}