// Key Perch word and sentence bank. All original, all G-rated.
// The lesson builder filters these by the keys a child has learned so far.

export const WORDS = `
a ad add adds ah ask asks all alas dad dads fad fads fall falls flask flasks lad lads lass sad salad salads sass
ash dash dish fish gash gas glad glass flag flags flash gala hag had half hall halls has hash shall slash lash sash
gag sag jag sash shag hadas
as ha aha
tree trees true try tray trip trail train treat trade tide time tiger tire top toy town today told too took tool
eat ear east easy eel egg else end even ever every eye
it its if is ice idea inch into ink iron island
red rat rag rain ran read real rest rice ride rise road rock roll room rope rose run rug
up us use under until upon
yes yet you your year yard yell yellow
we was way wet win wish wing wood wool word work world
old on one only open orange other our out owl over own oak odd off oil
quack queen quick quiet quilt quit quite quiz
pal pan park part path pear pen pet pie pig pin pit plan play pod pool pot pull pup
her here hero hat head heat help hen hide high hill hike hit hold hole home hop hope horse hot hug hut
sea seat see seed sell seal set she ship shoe shop show side sing sit six sky sled slip slow small snow soap soft song soon spot star stay step stop story sun swim
let lake lamp land last late leaf leg lift light like line lion lip list little log long look loud love low lucky lunch
door dog doll dot down draw dream dress drip drop drum duck dust dish day deer deep did
far farm fast feet fern few fig fill fin find fire first fit five fix fly fog food foot fork fort four fox free frog from fun fur
gate gift girl give goat gold good grape grass great green grow gum
jam jar jet jog join joke joy jump just jelly
keep key kick kid kind king kite kiss kit kitten knee knot know
ball bake band bank barn bat bay beach bean bear bed bee bell belt best big bike bird bit blue boat book boot box boy bring brook brown bug bump bus but buy by
cake call camp can cap car card care cart cat cave chair chalk chat chin clap class clay clean climb clock close cloud clue coat cold comb cook corn cow crab crown cub cup cut
map make man many march mat may me meal melt milk mine mint mix mom moon more moss most mouse move mud mug music my
name nap near neat neck need nest net new next nice night nine no nod noon nose note now nut
van vest very view vine violin visit voice vote
zebra zero zip zone zoo zoom
box fox six wax mix fix next taxi
the then them there they this that these those thin thing think three throw thank
and any are at be been before big both but come could
do does done each for get go goes got
he him his how in look made more much must
not of or put said say so some than to two very want well went were what when where which who why will with would
apple about above across after again air along also always animal another around away
baby back basket because began begin behind below between bird black bread breakfast bridge bright brother build butter
candle carrot catch center chicken children circle city color corner country cover
dance dark daisy desert dinner dolphin dragon dry
early earth eagle elephant enough evening
family farmer father feather field finger fishing flower follow forest found friend garden gentle giant ginger glove grandma grandpa ground
happy hammer harvest honey house hungry hurry
inside invite
jacket jungle
kitchen ladder laugh learn lemon letter library listen lizard
magic maple marble meadow middle minute mirror monkey morning mother mountain muffin
nature never night noodle number
ocean octopus often orchard outside
paint paper parade parrot peach penguin pencil people pepper picnic picture pillow pirate planet plant pocket pony puppy puzzle
rabbit raccoon rainbow reach river robin robot rocket round
sandwich school science second seven shadow shell shiny silver sister smile snack snail spider spring squirrel stone street strong summer sunny supper sweet
table teacher thumb ticket today together tomato tomorrow tonight tower travel trumpet turtle
umbrella uncle unicorn
valley village wagon walk warm water watch whale wheel white wind window winter wonder yogurt
hoot perch branch twig nestle feather wings swoop flutter
`.trim().split(/\s+/).filter((w, i, all) => all.indexOf(w) === i && !['hadas', 'gash', 'shag', 'hag', 'kiss'].includes(w));

// Written with normal capitals and punctuation. Before a child has learned
// Shift or punctuation the builder lowers the case and strips those marks.
export const SENTENCES = `
dad has a flask
a lad asks dad
all fall; all fall
a glad lass has a salad
dad had a sad fall
ask a lad; ask a lass
a flag flash; a glass flask
shall dad add salsa
The red fish sat at the lake.
Her fat cat sat at the door.
Let the little dog dig here.
Our tree is tall and old.
I like to eat ice at the lake.
She said the sea is too far.
A little owl sat there.
We had fresh jelly at the fair.
The story is short and sweet.
This fox is so quiet.
Dad will read her that story.
It is time to go to the fair.
The frog hid at the edge of the pool.
Please pass the pepper to Pop.
A queen quietly quit the race.
Two owls sat up all night.
You can fly if you try.
Would you like to swim today?
Where did the little fox go?
Why is the sky so blue?
Can you find the green frog?
Who ate all of the pie?
Is it time for lunch yet?
What is in your red box?
My pet zebra likes jazz.
The brown bear naps in a cave.
Five big bugs ran across my bench.
Mix the cake and bake it for lunch.
The moon came up over the barn.
Max can jump over a very big box.
Vic gave me a warm blue jacket.
Bring your book, your bike, and your kite.
Birds, bees, and bugs all buzz by.
We went to camp, and we made a fire.
Most owls hunt at night.
Zoe saw six zebras at the zoo.
The quick brown owl jumps over a lazy log.
A big blue whale swam by my boat.
Keep your eyes on the words.
Curve your fingers and sit up tall.
Your thumb is the boss of the space bar.
Home row is where your fingers live.
Good typing is calm, steady, and neat.
Slow and right beats fast and wrong.
Nora and Sam made a fort in the yard.
Jack and Ivy baked a pie for Grandma.
Uncle Ben plays the drums in a band.
Lily found a snail in the garden.
On Monday we go to the library.
In June we swim in the lake.
Tom read a book to Mia and Kate.
Rosa drew a dragon with green wings.
Pete fed his pony an apple and a carrot.
Ella has a pet duck named Waffles.
Did Omar see the rainbow?
Can Anna come to the park?
Will Grandpa fix the old wagon?
Are the kittens asleep yet?
We saw 12 owls in the 3 old trees.
Our team won by 4 points.
There are 7 days in a week.
A spider has 8 legs and a bird has 2.
I have 10 fingers and 10 toes.
Mom baked 24 muffins for the 6 of us.
We walked 5 miles to the lake.
Our class has 28 desks and 2 big windows.
Grandpa is 67 and Grandma is 65.
The bus comes at 8 and leaves at 9.
My book has 150 pages.
It took 30 minutes to reach the top of the hill.
There are 365 days in a year.
`.trim().split('\n').map((s) => s.trim());

// Longer passages for the speed unit and the one minute typing check.
export const PASSAGES = `
Every evening the little owl flew to the top of the old oak tree. She liked to look out over the quiet fields. The stars came out one by one, and the crickets began to sing. From up there the whole world looked soft and small.
Sam had a plan. He would build a raft from old boards and float it across the pond. His sister said it would sink. It did sink, right in the middle, and the two of them laughed so hard that the ducks flew away.
A good typist does not hurry. She sits up tall and keeps her eyes on the words. Her fingers rest on the home row, and they reach out only as far as they need to. Then they come right back home again.
The bakery on our street opens before the sun comes up. By the time we walk to school the whole block smells like warm bread. On Friday the baker gives each of us a small roll, and we eat it on the way.
Deep in the forest there is a stream that nobody has named. It runs over smooth gray stones and under a fallen log. Foxes drink from it at night. In the spring, small green frogs sing along its banks until morning.
My grandfather keeps bees behind his barn. He moves slowly and speaks softly when he opens the hives. He says that bees can tell when you are in a rush. When the honey is ready, he fills a jar for each of us.
Snow began to fall just after lunch. By the end of the school day it covered the swings and the slide. We walked home with our hoods up, and we made one long line of footprints all the way down the hill.
The robot in our classroom can only do what we tell it. If we give it the wrong steps, it bumps into the wall. We have learned to think carefully and to try again. Last week it finally made it through the whole maze.
Pirates once hid a chest of gold on a tiny island, or so the old story goes. Many people have gone to look for it with maps and shovels. Nobody has found it yet. Maybe the real treasure is a good day at the beach.
Practice does not have to be long to work. A few calm minutes each day will beat one long hour on a weekend. Your fingers remember what you do most often. So do it the right way, and soon you will not even have to think.
`.trim().split('\n').map((s) => s.trim());
