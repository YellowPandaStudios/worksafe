"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";
import { CalendarIcon, ChevronsUpDown } from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { FileUpload } from "@/components/ui/file-upload";

export default function ComponentsPage() {
  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">
              Component Showcase
            </h1>
            <p className="text-text-secondary">
              Work Safe i Sverige AB - Design System
            </p>
          </div>
          <ThemeToggle />
        </div>

        <Separator />

        {/* Typography */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Typography
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h1 className="text-4xl font-bold">Heading 1 - Sora</h1>
                <h2 className="text-3xl font-semibold">Heading 2 - Sora</h2>
                <h3 className="text-2xl font-semibold">Heading 3 - Sora</h3>
                <h4 className="text-xl font-semibold">Heading 4 - Sora</h4>
                <p className="text-base">Body text - Inter (400)</p>
                <p className="text-base font-medium">Body text - Inter (500)</p>
                <p className="text-base font-semibold">
                  Body text - Inter (600)
                </p>
                <p className="text-base font-bold">Body text - Inter (700)</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Colors - Service Colors */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Service Colors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Fire */}
            <Card>
              <CardHeader>
                <CardTitle>Fire (Brandskydd)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  <div className="w-16 h-16 rounded bg-fire-50 border border-border-light"></div>
                  <div className="w-16 h-16 rounded bg-fire-300 border border-border-light"></div>
                  <div className="w-16 h-16 rounded bg-fire-500 border border-border-light"></div>
                  <div className="w-16 h-16 rounded bg-fire-700 border border-border-light"></div>
                </div>
                <p className="text-sm text-text-secondary">50, 300, 500, 700</p>
              </CardContent>
            </Card>

            {/* Medical */}
            <Card>
              <CardHeader>
                <CardTitle>Medical (Sjukvård)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  <div className="w-16 h-16 rounded bg-medical-50 border border-border-light"></div>
                  <div className="w-16 h-16 rounded bg-medical-300 border border-border-light"></div>
                  <div className="w-16 h-16 rounded bg-medical-500 border border-border-light"></div>
                  <div className="w-16 h-16 rounded bg-medical-700 border border-border-light"></div>
                </div>
                <p className="text-sm text-text-secondary">50, 300, 500, 700</p>
              </CardContent>
            </Card>

            {/* AED */}
            <Card>
              <CardHeader>
                <CardTitle>AED (Hjärtstartare)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  <div className="w-16 h-16 rounded bg-aed-50 border border-border-light"></div>
                  <div className="w-16 h-16 rounded bg-aed-300 border border-border-light"></div>
                  <div className="w-16 h-16 rounded bg-aed-500 border border-border-light"></div>
                  <div className="w-16 h-16 rounded bg-aed-700 border border-border-light"></div>
                </div>
                <p className="text-sm text-text-secondary">50, 300, 500, 700</p>
              </CardContent>
            </Card>

            {/* First Aid */}
            <Card>
              <CardHeader>
                <CardTitle>First Aid (Första hjälpen)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  <div className="w-16 h-16 rounded bg-first-aid-50 border border-border-light"></div>
                  <div className="w-16 h-16 rounded bg-first-aid-300 border border-border-light"></div>
                  <div className="w-16 h-16 rounded bg-first-aid-500 border border-border-light"></div>
                  <div className="w-16 h-16 rounded bg-first-aid-700 border border-border-light"></div>
                </div>
                <p className="text-sm text-text-secondary">50, 300, 500, 700</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Semantic Colors */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Semantic Colors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="w-full h-12 rounded bg-success"></div>
                  <p className="text-sm font-medium">Success</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="w-full h-12 rounded bg-warning"></div>
                  <p className="text-sm font-medium">Warning</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="w-full h-12 rounded bg-error"></div>
                  <p className="text-sm font-medium">Error</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="w-full h-12 rounded bg-info"></div>
                  <p className="text-sm font-medium">Info</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Buttons</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button disabled>Disabled</Button>
                <Button variant="outline" disabled>
                  Disabled Outline
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Badges */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Badges</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-wrap gap-4">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
              <div className="flex flex-wrap gap-4">
                <Badge className="bg-fire-500">Fire</Badge>
                <Badge className="bg-medical-500">Medical</Badge>
                <Badge className="bg-aed-500">AED</Badge>
                <Badge className="bg-first-aid-500">First Aid</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Form Elements */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Form Elements
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="input-example">Input</Label>
                <Input id="input-example" placeholder="Enter text..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="textarea-example">Textarea</Label>
                <Textarea
                  id="textarea-example"
                  placeholder="Enter longer text..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="select-example">Select</Label>
                <Select>
                  <SelectTrigger id="select-example">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="checkbox-example" />
                <Label htmlFor="checkbox-example" className="cursor-pointer">
                  Accept terms and conditions
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="switch-example" />
                <Label htmlFor="switch-example" className="cursor-pointer">
                  Enable notifications
                </Label>
              </div>
              <div className="space-y-2">
                <Label>Radio Group</Label>
                <RadioGroup defaultValue="option1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option1" id="radio1" />
                    <Label htmlFor="radio1" className="cursor-pointer">
                      Option 1
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option2" id="radio2" />
                    <Label htmlFor="radio2" className="cursor-pointer">
                      Option 2
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option3" id="radio3" />
                    <Label htmlFor="radio3" className="cursor-pointer">
                      Option 3
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slider-example">Slider</Label>
                <Slider
                  id="slider-example"
                  defaultValue={[50]}
                  max={100}
                  step={1}
                />
                <p className="text-sm text-text-secondary">Value: 50</p>
              </div>
              <div className="space-y-2">
                <Label>File Upload</Label>
                <FileUpload
                  maxFiles={5}
                  maxSize={10 * 1024 * 1024} // 10MB
                  accept={{
                    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
                    "application/pdf": [".pdf"],
                  }}
                  showPreview={true}
                />
              </div>
              <div className="space-y-2">
                <Label>File Upload (Single File)</Label>
                <FileUpload
                  maxFiles={1}
                  maxSize={5 * 1024 * 1024} // 5MB
                  accept={{
                    "image/*": [".png", ".jpg", ".jpeg"],
                  }}
                  showPreview={true}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Date Picker */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Date Picker
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Calendar</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Pick a date
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Calendar (Inline)</Label>
                <Calendar mode="single" className="rounded-md border" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Popover */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Popover</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Open Popover</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="space-y-2">
                      <h4 className="font-medium">Popover Title</h4>
                      <p className="text-sm text-text-secondary">
                        This is a popover component. It can contain any content
                        you need.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Command / Command Palette */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Command Palette
          </h2>
          <Card>
            <CardContent className="pt-6">
              <Command className="rounded-lg border shadow-md">
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Suggestions">
                    <CommandItem>
                      <span>Calendar</span>
                    </CommandItem>
                    <CommandItem>
                      <span>Search Emoji</span>
                    </CommandItem>
                    <CommandItem>
                      <span>Calculator</span>
                    </CommandItem>
                  </CommandGroup>
                  <CommandGroup heading="Settings">
                    <CommandItem>
                      <span>Profile</span>
                      <CommandShortcut>⌘P</CommandShortcut>
                    </CommandItem>
                    <CommandItem>
                      <span>Billing</span>
                      <CommandShortcut>⌘B</CommandShortcut>
                    </CommandItem>
                    <CommandItem>
                      <span>Settings</span>
                      <CommandShortcut>⌘S</CommandShortcut>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </CardContent>
          </Card>
        </section>

        {/* Combobox */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Combobox</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Select Service</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      Select service...
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search services..." />
                      <CommandList>
                        <CommandEmpty>No service found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem value="fire">
                            Fire Safety (Brandskydd)
                          </CommandItem>
                          <CommandItem value="medical">
                            Medical (Sjukvård)
                          </CommandItem>
                          <CommandItem value="aed">
                            AED (Hjärtstartare)
                          </CommandItem>
                          <CommandItem value="first-aid">
                            First Aid (Första hjälpen)
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Select Language</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      Select language...
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search languages..." />
                      <CommandList>
                        <CommandEmpty>No language found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem value="sv">
                            Swedish (Svenska)
                          </CommandItem>
                          <CommandItem value="en">English</CommandItem>
                          <CommandItem value="no">
                            Norwegian (Norsk)
                          </CommandItem>
                          <CommandItem value="da">Danish (Dansk)</CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Combobox */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Combobox</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Select Service</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      Select service...
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search services..." />
                      <CommandList>
                        <CommandEmpty>No service found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem value="fire">
                            Fire Safety (Brandskydd)
                          </CommandItem>
                          <CommandItem value="medical">
                            Medical (Sjukvård)
                          </CommandItem>
                          <CommandItem value="aed">
                            AED (Hjärtstartare)
                          </CommandItem>
                          <CommandItem value="first-aid">
                            First Aid (Första hjälpen)
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Select Language</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      Select language...
                      <CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search languages..." />
                      <CommandList>
                        <CommandEmpty>No language found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem value="sv">
                            Swedish (Svenska)
                          </CommandItem>
                          <CommandItem value="en">English</CommandItem>
                          <CommandItem value="no">
                            Norwegian (Norsk)
                          </CommandItem>
                          <CommandItem value="da">Danish (Dansk)</CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Field Component */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Field Component
          </h2>
          <Card>
            <CardContent className="pt-6">
              <FieldSet>
                <FieldLegend>Form Example with Field Component</FieldLegend>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="field-name">Name</FieldLabel>
                    <FieldContent>
                      <Input id="field-name" placeholder="Enter your name" />
                      <FieldDescription>
                        This is your display name.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="field-email">Email</FieldLabel>
                    <FieldContent>
                      <Input
                        id="field-email"
                        type="email"
                        placeholder="Enter your email"
                      />
                      <FieldDescription>
                        We&apos;ll never share your email.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                  <Field orientation="horizontal">
                    <FieldLabel htmlFor="field-terms">
                      <Checkbox id="field-terms" />
                      Accept terms and conditions
                    </FieldLabel>
                    <FieldContent>
                      <FieldError>This field is required</FieldError>
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </Card>
        </section>

        {/* Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary">
                  Card content with some text to demonstrate the layout.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
                  Action
                </Button>
              </CardFooter>
            </Card>
            <Card className="accent-fire">
              <CardHeader>
                <CardTitle>Fire Service</CardTitle>
                <CardDescription>Brandskydd</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary">
                  Fire safety services card.
                </p>
              </CardContent>
            </Card>
            <Card className="accent-medical">
              <CardHeader>
                <CardTitle>Medical Service</CardTitle>
                <CardDescription>Sjukvård</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary">Medical services card.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tabs */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Tabs</h2>
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="tab1">
                <TabsList>
                  <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                  <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                  <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1" className="mt-4">
                  <p>Content for Tab 1</p>
                </TabsContent>
                <TabsContent value="tab2" className="mt-4">
                  <p>Content for Tab 2</p>
                </TabsContent>
                <TabsContent value="tab3" className="mt-4">
                  <p>Content for Tab 3</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        {/* Accordion */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Accordion
          </h2>
          <Card>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Is it accessible?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It adheres to the WAI-ARIA design pattern.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Is it styled?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It comes with default styles that match the other
                    components aesthetic.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Is it animated?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It&apos;s animated by default, but you can disable it
                    if you prefer.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* Dialog */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Dialog</h2>
          <Card>
            <CardContent className="pt-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline">Cancel</Button>
                    <Button variant="destructive">Delete</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </section>

        {/* Sheet */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Sheet</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-wrap gap-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">Open Right Sheet</Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Sheet Title</SheetTitle>
                      <SheetDescription>
                        This is a sheet that slides in from the right side.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4 space-y-4">
                      <p className="text-text-secondary">
                        Sheet content goes here. You can add any content you
                        need.
                      </p>
                    </div>
                  </SheetContent>
                </Sheet>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">Open Left Sheet</Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Left Side Sheet</SheetTitle>
                      <SheetDescription>
                        This sheet slides in from the left.
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">Open Bottom Sheet</Button>
                  </SheetTrigger>
                  <SheetContent side="bottom">
                    <SheetHeader>
                      <SheetTitle>Bottom Sheet</SheetTitle>
                      <SheetDescription>
                        This sheet slides up from the bottom.
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Table */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Table</h2>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableCaption>A list of recent services.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      Fire Safety Training
                    </TableCell>
                    <TableCell>Brandskydd</TableCell>
                    <TableCell>
                      <Badge variant="outline">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">2,500 SEK</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Medical First Aid
                    </TableCell>
                    <TableCell>Sjukvård</TableCell>
                    <TableCell>
                      <Badge variant="outline">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">1,800 SEK</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">AED Training</TableCell>
                    <TableCell>Hjärtstartare</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Pending</Badge>
                    </TableCell>
                    <TableCell className="text-right">3,200 SEK</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      First Aid Course
                    </TableCell>
                    <TableCell>Första hjälpen</TableCell>
                    <TableCell>
                      <Badge variant="outline">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">2,100 SEK</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* Toast / Sonner */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Toast Notifications
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() =>
                    toast.success("Operation completed successfully!")
                  }
                >
                  Success Toast
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => toast.error("Something went wrong!")}
                >
                  Error Toast
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast.warning("Please review this action")}
                >
                  Warning Toast
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => toast.info("Here&apos;s some information")}
                >
                  Info Toast
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    toast.loading("Processing...", { id: "loading" });
                    setTimeout(() => {
                      toast.success("Done!", { id: "loading" });
                    }, 2000);
                  }}
                >
                  Loading Toast
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Avatar */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Avatar</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar className="h-16 w-16">
                  <AvatarFallback>WS</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Breadcrumb */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Breadcrumb
          </h2>
          <Card>
            <CardContent className="pt-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Components</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </CardContent>
          </Card>
        </section>

        {/* Menubar */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Menubar</h2>
          <Card>
            <CardContent className="pt-6">
              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger>File</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>
                      New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>New Window</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem>Share</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>Edit</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>Undo</MenubarItem>
                    <MenubarItem>Redo</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>View</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>Always Show Bookmarks Bar</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </CardContent>
          </Card>
        </section>

        {/* Navigation Menu */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Navigation Menu
          </h2>
          <Card>
            <CardContent className="pt-6">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>
                      Getting started
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 w-[400px]">
                        <li>
                          <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">
                              Introduction
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Re-usable components built using Radix UI and
                              Tailwind CSS.
                            </p>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 w-[400px]">
                        <li>
                          <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">
                              All Components
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Beautifully designed components that you can copy
                              and paste.
                            </p>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </CardContent>
          </Card>
        </section>

        {/* Pagination */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Pagination
          </h2>
          <Card>
            <CardContent className="pt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      2
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardContent>
          </Card>
        </section>

        {/* Skeleton */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Skeleton</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </section>

        {/* Input OTP */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Input OTP
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label>Enter verification code</Label>
                <InputOTP maxLength={6}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Toggle Group */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Toggle Group
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Single Selection</Label>
                <ToggleGroup type="single">
                  <ToggleGroupItem value="a" aria-label="Toggle bold">
                    <span>Bold</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="b" aria-label="Toggle italic">
                    <span>Italic</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="c" aria-label="Toggle underline">
                    <span>Underline</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="space-y-2">
                <Label>Multiple Selection</Label>
                <ToggleGroup type="multiple">
                  <ToggleGroupItem value="1" aria-label="Toggle 1">
                    <span>Option 1</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="2" aria-label="Toggle 2">
                    <span>Option 2</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="3" aria-label="Toggle 3">
                    <span>Option 3</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Collapsible */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Collapsible
          </h2>
          <Card>
            <CardContent className="pt-6">
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="outline">Toggle</Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-4">
                  <div className="rounded-md border px-4 py-2 text-sm">
                    This is collapsible content. It can be shown or hidden.
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </section>

        {/* Scroll Area */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Scroll Area
          </h2>
          <Card>
            <CardContent className="pt-6">
              <ScrollArea className="h-32 w-full rounded-md border p-4">
                <div className="space-y-2">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="text-sm">
                      Item {i + 1}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </section>

        {/* Tooltip */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Tooltip</h2>
          <Card>
            <CardContent className="pt-6">
              <TooltipProvider>
                <div className="flex gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover me</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This is a tooltip</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Or me</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Another tooltip with more text</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>
        </section>

        {/* Progress */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Progress</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>33%</span>
                </div>
                <Progress value={33} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>66%</span>
                </div>
                <Progress value={66} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>100%</span>
                </div>
                <Progress value={100} />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Hover Card */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Hover Card
          </h2>
          <Card>
            <CardContent className="pt-6">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="link">@worksafe</Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex justify-between space-x-4">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>WS</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">@worksafe</h4>
                      <p className="text-sm">
                        Work Safe i Sverige AB - Safety training and services.
                      </p>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </CardContent>
          </Card>
        </section>

        {/* Carousel */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Carousel</h2>
          <Card>
            <CardContent className="pt-6">
              <Carousel className="w-full max-w-xs mx-auto">
                <CarouselContent>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-6">
                            <span className="text-4xl font-semibold">
                              {index + 1}
                            </span>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </CardContent>
          </Card>
        </section>

        {/* Empty */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Empty</h2>
          <Card>
            <CardContent className="pt-6">
              <Empty>
                <EmptyTitle>No items found</EmptyTitle>
                <EmptyDescription>
                  Get started by creating a new item.
                </EmptyDescription>
              </Empty>
            </CardContent>
          </Card>
        </section>

        {/* Sidebar */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">Sidebar</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-text-secondary mb-4">
                Sidebar is a complex layout component. See the shadcn
                documentation for full implementation examples.
              </p>
              <div className="rounded-md border p-4 bg-surface-secondary">
                <p className="text-sm text-text-tertiary">
                  Sidebar component is typically used for navigation layouts. It
                  includes SidebarProvider, SidebarTrigger, SidebarContent,
                  SidebarGroup, SidebarMenu, and more sub-components.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Design System Colors */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            Design System Colors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Backgrounds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-4 rounded bg-bg-primary border border-border-default">
                  bg-primary
                </div>
                <div className="p-4 rounded bg-bg-secondary border border-border-default">
                  bg-secondary
                </div>
                <div className="p-4 rounded bg-bg-tertiary border border-border-default">
                  bg-tertiary
                </div>
                <div className="p-4 rounded bg-bg-elevated border border-border-default">
                  bg-elevated
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Surfaces</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-4 rounded bg-surface-primary border border-border-default">
                  surface-primary
                </div>
                <div className="p-4 rounded bg-surface-secondary border border-border-default">
                  surface-secondary
                </div>
                <div className="p-4 rounded bg-surface-hover border border-border-default">
                  surface-hover
                </div>
                <div className="p-4 rounded bg-surface-active border border-border-default">
                  surface-active
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Text Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-text-primary">text-primary</p>
                <p className="text-text-secondary">text-secondary</p>
                <p className="text-text-tertiary">text-tertiary</p>
                <p className="text-text-disabled">text-disabled</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Neutrals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  <div className="w-12 h-12 rounded bg-neutral-50 border border-border-light"></div>
                  <div className="w-12 h-12 rounded bg-neutral-200 border border-border-light"></div>
                  <div className="w-12 h-12 rounded bg-neutral-400 border border-border-light"></div>
                  <div className="w-12 h-12 rounded bg-neutral-600 border border-border-light"></div>
                  <div className="w-12 h-12 rounded bg-neutral-800 border border-border-light"></div>
                  <div className="w-12 h-12 rounded bg-neutral-900 border border-border-light"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
