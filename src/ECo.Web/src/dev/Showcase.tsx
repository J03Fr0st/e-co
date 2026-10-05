import { useState, type ReactNode } from 'react'
import {
  Button,
  MachineNumber,
  Porthole,
  PortholePlaceholder,
  SteelPanel,
  Checkbox,
  Combobox,
  Dialog,
  DialogClose,
  ErrorState,
  RadioGroup,
  Readout,
  Select,
  Skeleton,
  TextField,
  useToast,
} from '@/ui'

/** Every primitive in every state, for the S2 checks (axe, keyboard, target size, reduced motion). */
export default function Showcase() {
  return (
    <div className="flex flex-col gap-8">
      <header className="max-w-prose">
        <h1 className="sign-type text-4xl text-enamel">Primitives</h1>
        <p className="mt-2 text-steel">Development only. Each component appears in the states the store uses.</p>
      </header>
      <MachineParts />
      <Palette />
      <Type />
      <Buttons />
      <Fields />
      <Choices />
      <Overlays />
      <Search />
      <Loading />
    </div>
  )
}

function Panel({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} data-testid={id} className="rounded-sign bg-tile-raised p-5 shadow-panel sm:p-6">
      <h2 id={id} className="sign-type mb-4 text-2xl text-enamel">
        {title}
      </h2>
      {children}
    </section>
  )
}

const colourways = [
  { value: 'ink', label: 'Ink', swatch: '#1f2a33' },
  { value: 'oat', label: 'Oat', swatch: '#d8cdb8' },
  { value: 'moss', label: 'Moss', swatch: '#5b6b4a' },
  { value: 'rust', label: 'Rust', swatch: '#9a4a2c', unavailable: true, unavailableLabel: 'Sold out' },
]

/** The materials of machine 01 together: the S3 first viewport's parts, not its layout. */
function MachineParts() {
  const toast = useToast()
  const [colour, setColour] = useState('ink')
  const [size, setSize] = useState('S')
  const [adds, setAdds] = useState(0)
  const colourName = colourways.find((c) => c.value === colour)?.label ?? ''

  return (
    <SteelPanel as="section" labelledBy="machine" className="grid gap-5 sm:grid-cols-[minmax(0,18rem)_1fr] sm:items-start">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <MachineNumber n={1} />
          <h2 id="machine" className="sign-type text-2xl text-enamel">
            Heavyweight crew tee
          </h2>
        </div>
        <Porthole turnKey={adds}>
          <PortholePlaceholder label={`Heavyweight crew tee in ${colourName}`} />
        </Porthole>
      </div>
      <div className="flex flex-col gap-5" data-testid="machine-panel">
        <p className="readout text-2xl">£32.00</p>
        <RadioGroup legend={`Colour: ${colourName}`} variant="swatches" value={colour} onValueChange={setColour} options={colourways} />
        <RadioGroup
          legend="Size"
          variant="buttons"
          value={size}
          onValueChange={setSize}
          options={[
            { value: 'XS', label: 'XS' },
            { value: 'S', label: 'S' },
            { value: 'M', label: 'M', unavailable: true, unavailableLabel: 'Sold out' },
            { value: 'L', label: 'L' },
            { value: 'XL', label: 'XL' },
          ]}
        />
        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            setAdds((n) => n + 1)
            toast({ title: 'Added to bag', description: `Heavyweight crew tee, ${size}, ${colourName}`, tone: 'success' })
          }}
        >
          Add to bag
        </Button>
      </div>
    </SteelPanel>
  )
}

const swatches = [
  ['tile', '#EEF3EF', 'Page ground', 'bg-tile text-ink'],
  ['ink', '#14201D', 'Text', 'bg-ink text-tile-raised'],
  ['steel', '#55625E', 'Secondary text, borders', 'bg-steel text-tile-raised'],
  ['enamel', '#11493F', 'Signage, primary action', 'bg-enamel text-enamel-ink'],
  ['steel panel', '#DCE2DF', 'Machine panels', 'bg-steel-panel text-ink'],
  ['amber', '#E8A317', 'Low stock, in progress', 'bg-amber text-amber-ink'],
  ['red', '#B42E1A', 'Needs action', 'bg-red text-enamel-ink'],
] as const

function Palette() {
  return (
    <Panel id="palette" title="Palette">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {swatches.map(([name, hex, role, classes]) => (
          <li key={name} className={`flex min-h-24 flex-col justify-between rounded-button p-3 ${classes}`}>
            <span className="readout text-sm uppercase">{name}</span>
            <span className="text-sm">
              {role}
              <br />
              <span className="readout">{hex}</span>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function Type() {
  return (
    <Panel id="type" title="Type">
      <p className="sign-type text-5xl text-enamel">Long Cycle</p>
      <p className="mt-3 max-w-prose text-lg">
        Archivo at normal width carries reading text. A heavyweight crew tee in organic cotton, cut to keep its shape after
        years of washing at thirty degrees.
      </p>
      <p className="readout mt-3 text-2xl">£42.00 · 03 left · 14:59</p>
    </Panel>
  )
}

function Buttons() {
  return (
    <Panel id="buttons" title="Buttons">
      <div className="flex flex-wrap items-center gap-3">
        <Button>Add to bag</Button>
        <Button variant="secondary">View details</Button>
        <Button variant="quiet">Clear filters</Button>
        <Button variant="danger">Refund order</Button>
        <Button disabled>Sold out</Button>
        <Button loading loadingLabel="Placing order">
          Place order
        </Button>
        <Button size="lg">Checkout</Button>
        <Button size="sm" variant="secondary">
          Undo
        </Button>
      </div>
    </Panel>
  )
}

function Fields() {
  return (
    <Panel id="fields" title="Fields">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Email" type="email" autoComplete="email" hint="We send the receipt to your demo inbox." />
        <TextField
          label="Postcode"
          autoComplete="postal-code"
          defaultValue="SW1A 1"
          error="Enter a full postcode, for example SW1A 1AA."
        />
        <TextField label="Discount code" disabled defaultValue="WELCOME10" />
        <Select
          label="Country"
          defaultValue="GB"
          options={[
            { value: 'GB', label: 'United Kingdom' },
            { value: 'IE', label: 'Ireland' },
            { value: 'XX', label: 'Elsewhere (not shipping yet)', disabled: true },
          ]}
        />
      </div>
    </Panel>
  )
}

function Choices() {
  const [size, setSize] = useState('S')
  return (
    <Panel id="choices" title="Choices">
      <div className="grid gap-6 sm:grid-cols-2">
        <RadioGroup
          legend="Size"
          variant="buttons"
          value={size}
          onValueChange={setSize}
          options={[
            { value: 'XS', label: 'XS' },
            { value: 'S', label: 'S' },
            { value: 'M', label: 'M', unavailable: true, unavailableLabel: 'Sold out' },
            { value: 'L', label: 'L' },
            { value: 'XL', label: 'XL' },
          ]}
        />
        <RadioGroup
          legend="Delivery"
          defaultValue="standard"
          options={[
            { value: 'standard', label: 'Standard, £3.95', detail: 'Free on orders over £50' },
            { value: 'express', label: 'Express, £7.95', detail: 'Next working day' },
          ]}
        />
        <Checkbox label="Save this address" detail="Use it next time you check out." defaultChecked />
        <div className="flex flex-wrap items-center gap-2">
          <Readout label="Stock" value="03" tone="attention" />
          <Readout label="Total" value="£46.95" />
        </div>
      </div>
    </Panel>
  )
}

function Overlays() {
  const toast = useToast()
  return (
    <Panel id="overlays" title="Dialogs and notices">
      <div className="flex flex-wrap gap-3">
        <Dialog
          trigger={<Button variant="secondary">Refund this order</Button>}
          title="Refund order LC-1042?"
          description="The full amount, £46.95, goes back to the test card. This cannot be undone."
        >
          <div className="flex flex-wrap justify-end gap-3">
            <DialogClose asChild>
              <Button variant="secondary">Keep order</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="danger">Refund £46.95</Button>
            </DialogClose>
          </div>
        </Dialog>
        <Button variant="secondary" onClick={() => toast({ title: 'Added to bag', description: 'Heavyweight crew tee, S, Ink', tone: 'success' })}>
          Show confirmation
        </Button>
        <Button variant="secondary" onClick={() => toast({ title: 'Address saved' })}>
          Show notice
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast({ title: 'Could not save address', description: 'Check your connection and try again.', tone: 'error' })}
        >
          Show failure
        </Button>
      </div>
    </Panel>
  )
}

const suggestions = [
  'Heavyweight crew tee',
  'Organic cotton long-sleeve tee',
  'Merino crew jumper',
  'Lambswool cardigan',
  'Waxed cotton field jacket',
  'Quilted liner jacket',
  'Straight-leg canvas trousers',
  'Pleated wool trousers',
]

function Search() {
  const [chosen, setChosen] = useState<{ value: string; picks: number }>()
  return (
    <Panel id="search" title="Search">
      <Combobox label="Search the shop" placeholder="Try “tee” or “wool”" suggestions={suggestions} onSelect={(value) => setChosen((c) => ({ value, picks: (c?.picks ?? 0) + 1 }))} />
      <p className="mt-3 text-sm text-steel" aria-live="polite" data-testid="search-chosen">
        {chosen ? `Chosen: ${chosen.value} (pick ${chosen.picks})` : 'Nothing chosen yet.'}
      </p>
    </Panel>
  )
}

function Loading() {
  const [failed, setFailed] = useState(true)
  return (
    <Panel id="loading" title="Loading and failure">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2" aria-label="Loading product" role="status">
          <Skeleton className="aspect-square w-full max-w-48 rounded-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-1/3" />
        </div>
        {failed ? (
          <ErrorState
            title="The catalogue did not load"
            message="Machine 02 lost its connection. Your bag is safe."
            onRetry={() => setFailed(false)}
          />
        ) : (
          <p className="font-medium" role="status">
            Catalogue loaded.
          </p>
        )}
      </div>
    </Panel>
  )
}
